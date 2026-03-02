const asyncHandler = require("../middleware/asyncHandler");
const { query, pool } = require("../config/db");

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function normalizeLimit(value, fallback, max) {
  const parsed = parsePositiveInt(value);
  if (!parsed) return fallback;
  return Math.min(parsed, max);
}

function normalizeDateTimeForMySql(value) {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const mysqlLikeMatch = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?$/);
  if (mysqlLikeMatch) {
    const datePart = mysqlLikeMatch[1];
    const timePart = mysqlLikeMatch[2];
    const secondPart = mysqlLikeMatch[3] || ":00";
    return `${datePart} ${timePart}${secondPart}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 19).replace("T", " ");
}

function parseMySqlUtcToDate(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function getEmployeeScope(req, requestedEmployeeIdRaw) {
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const requestedEmployeeId = parsePositiveInt(requestedEmployeeIdRaw);
  const isAdmin = req.user?.is_admin === true;

  if (!authEmployeeId) {
    return { error: "Invalid authenticated user." };
  }

  if (isAdmin && !requestedEmployeeId) {
    return { employeeId: null, includeAll: true };
  }

  if (isAdmin && requestedEmployeeId) {
    return { employeeId: requestedEmployeeId, includeAll: false };
  }

  return { employeeId: authEmployeeId, includeAll: false };
}

function canManageBooking(req, bookingEmployeeId) {
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const targetEmployeeId = parsePositiveInt(bookingEmployeeId);
  const isAdmin = req.user?.is_admin === true;

  if (!authEmployeeId || !targetEmployeeId) return false;
  if (isAdmin) return true;
  return authEmployeeId === targetEmployeeId;
}

const getUpcomingBookings = asyncHandler(async (req, res) => {
  const scope = getEmployeeScope(req, req.query.employee_id);
  if (scope.error) {
    return res.status(401).json({ message: scope.error });
  }

  const limit = normalizeLimit(req.query.limit, 20, 200);
  const includePast = toBoolean(req.query.include_past);
  const includeCancelled = toBoolean(req.query.include_cancelled);
  const statuses = includeCancelled ? ["confirmed", "pending", "cancelled"] : ["confirmed", "pending"];

  const statusPlaceholders = statuses.map(() => "?").join(", ");
  let sql = `
    SELECT
      b.booking_id,
      b.title,
      b.description,
      b.start_time,
      b.end_time,
      b.status,
      b.employee_id,
      e.name AS employee_name,
      mr.room_id,
      mr.name AS room_name,
      mr.capacity AS room_capacity,
      l.location_id,
      l.name AS location_name
    FROM booking b
    INNER JOIN employee e ON e.employee_id = b.employee_id
    INNER JOIN meeting_room mr ON mr.room_id = b.room_id
    INNER JOIN location l ON l.location_id = mr.location_id
    WHERE b.status IN (${statusPlaceholders})
  `;

  const params = [...statuses];

  if (!includePast) {
    sql += " AND b.start_time >= UTC_TIMESTAMP()";
  }

  if (!scope.includeAll) {
    sql += " AND b.employee_id = ?";
    params.push(scope.employeeId);
  }

  sql += includePast ? " ORDER BY b.start_time DESC" : " ORDER BY b.start_time ASC";
  sql += ` LIMIT ${limit}`;

  const rows = await query(sql, params);
  res.json(rows);
});

const getBookingSummary = asyncHandler(async (req, res) => {
  const scope = getEmployeeScope(req, req.query.employee_id);
  if (scope.error) {
    return res.status(401).json({ message: scope.error });
  }

  const whereClause = scope.includeAll ? "" : "WHERE b.employee_id = ?";
  const whereParams = scope.includeAll ? [] : [scope.employeeId];

  const summaryRows = await query(
    `
      SELECT
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN DATE(b.start_time) = UTC_DATE() AND b.status IN ('confirmed', 'pending') THEN 1 ELSE 0 END) AS rooms_booked_today,
        SUM(CASE WHEN b.start_time >= UTC_TIMESTAMP() AND b.status IN ('confirmed', 'pending') THEN 1 ELSE 0 END) AS upcoming_meetings,
        SUM(
          CASE
            WHEN b.start_time >= UTC_TIMESTAMP()
             AND b.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)
             AND b.status IN ('confirmed', 'pending')
            THEN 1 ELSE 0
          END
        ) AS upcoming_meetings_week,
        SUM(CASE WHEN b.status = 'pending' AND b.start_time >= UTC_TIMESTAMP() THEN 1 ELSE 0 END) AS open_requests,
        SUM(
          CASE
            WHEN DATE(b.start_time) = UTC_DATE() AND b.status = 'confirmed'
            THEN TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time)
            ELSE 0
          END
        ) AS booked_minutes_today,
        SUM(
          CASE
            WHEN b.start_time >= UTC_TIMESTAMP()
             AND b.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)
             AND b.status = 'confirmed'
            THEN TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time)
            ELSE 0
          END
        ) AS booked_minutes_week
      FROM booking b
      ${whereClause}
    `,
    whereParams
  );

  const roomRows = await query("SELECT COUNT(*) AS total_rooms FROM meeting_room");
  const totalRooms = Number(roomRows[0]?.total_rooms || 0);
  const bookedMinutesToday = Number(summaryRows[0]?.booked_minutes_today || 0);
  const bookedMinutesWeek = Number(summaryRows[0]?.booked_minutes_week || 0);
  const totalWorkdayMinutes = totalRooms * 9 * 60;

  const utilization =
    totalWorkdayMinutes > 0 ? Math.min(100, Math.round((bookedMinutesToday / totalWorkdayMinutes) * 100)) : 0;
  const bookedHoursWeek = Math.round((bookedMinutesWeek / 60) * 10) / 10;

  res.json({
    total_bookings: Number(summaryRows[0]?.total_bookings || 0),
    rooms_booked_today: Number(summaryRows[0]?.rooms_booked_today || 0),
    upcoming_meetings: Number(summaryRows[0]?.upcoming_meetings || 0),
    upcoming_meetings_week: Number(summaryRows[0]?.upcoming_meetings_week || 0),
    open_requests: Number(summaryRows[0]?.open_requests || 0),
    utilization_percent: utilization,
    booked_hours_week: bookedHoursWeek
  });
});

const getBookingReports = asyncHandler(async (req, res) => {
  if (req.user?.is_admin !== true) {
    return res.status(403).json({ message: "Admin access is required." });
  }

  const summaryRows = await query(
    `
      SELECT
        SUM(CASE WHEN b.start_time >= UTC_TIMESTAMP() AND b.status IN ('confirmed', 'pending') THEN 1 ELSE 0 END) AS upcoming_count,
        SUM(CASE WHEN b.status = 'pending' AND b.start_time >= UTC_TIMESTAMP() THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN DATE(b.start_time) = UTC_DATE() AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_today
      FROM booking b
    `
  );

  const byLocationRows = await query(
    `
      SELECT
        l.name AS location_name,
        COUNT(*) AS booking_count
      FROM booking b
      INNER JOIN meeting_room mr ON mr.room_id = b.room_id
      INNER JOIN location l ON l.location_id = mr.location_id
      WHERE b.status IN ('confirmed', 'pending')
        AND b.start_time >= UTC_TIMESTAMP()
        AND b.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY l.location_id, l.name
      ORDER BY booking_count DESC, l.name ASC
      LIMIT 10
    `
  );

  const upcomingRows = await query(
    `
      SELECT
        b.booking_id,
        b.title,
        b.start_time,
        b.end_time,
        b.status,
        e.name AS employee_name,
        mr.name AS room_name,
        l.name AS location_name
      FROM booking b
      INNER JOIN employee e ON e.employee_id = b.employee_id
      INNER JOIN meeting_room mr ON mr.room_id = b.room_id
      INNER JOIN location l ON l.location_id = mr.location_id
      WHERE b.status IN ('confirmed', 'pending')
        AND b.start_time >= UTC_TIMESTAMP()
      ORDER BY b.start_time ASC
      LIMIT 25
    `
  );

  res.json({
    summary: {
      upcoming_count: Number(summaryRows[0]?.upcoming_count || 0),
      pending_count: Number(summaryRows[0]?.pending_count || 0),
      confirmed_today: Number(summaryRows[0]?.confirmed_today || 0),
      top_location: byLocationRows[0]?.location_name || "-"
    },
    by_location: byLocationRows.map(row => ({
      location_name: row.location_name,
      booking_count: Number(row.booking_count || 0)
    })),
    upcoming: upcomingRows,
    generated_at: new Date().toISOString()
  });
});

const createBooking = asyncHandler(async (req, res) => {
  const { room_id, employee_id, title, description, start_time, end_time } = req.body || {};
  const status = req.body?.status || "confirmed";

  const roomId = parsePositiveInt(room_id);
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const requestedEmployeeId = parsePositiveInt(employee_id);
  const isAdmin = req.user?.is_admin === true;
  const employeeId = isAdmin ? requestedEmployeeId || authEmployeeId : authEmployeeId;
  const allowedStatus = ["confirmed", "pending", "cancelled"];

  if (!authEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  const normalizedTitle = String(title || "").trim();
  const normalizedDescription = String(description || "").trim();

  if (!roomId || !employeeId || !normalizedTitle || !normalizedDescription || !start_time || !end_time) {
    return res
      .status(400)
      .json({ message: "room_id, title, description, start_time, end_time are required." });
  }

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  const startTimeSql = normalizeDateTimeForMySql(start_time);
  const endTimeSql = normalizeDateTimeForMySql(end_time);
  if (!startTimeSql || !endTimeSql) {
    return res.status(400).json({ message: "Invalid start_time or end_time format." });
  }

  const startDate = parseMySqlUtcToDate(startTimeSql);
  const endDate = parseMySqlUtcToDate(endTimeSql);
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Invalid start_time or end_time format." });
  }

  if (endTimeSql <= startTimeSql) {
    return res.status(400).json({ message: "end_time must be greater than start_time." });
  }

  if (startDate.getTime() < Date.now()) {
    return res.status(400).json({ message: "You cannot book for past date/time." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [roomRows] = await connection.execute(
      `
        SELECT room_id
        FROM meeting_room
        WHERE room_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [roomId]
    );

    if (roomRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Room not found." });
    }

    const [conflictRows] = await connection.execute(
      `
        SELECT booking_id
        FROM booking
        WHERE room_id = ?
          AND status IN ('confirmed', 'pending')
          AND start_time < ?
          AND end_time > ?
        LIMIT 1
        FOR UPDATE
      `,
      [roomId, endTimeSql, startTimeSql]
    );

    if (conflictRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Room is already booked for the selected time slot." });
    }

    const [insertResult] = await connection.execute(
      `
        INSERT INTO booking (room_id, employee_id, title, description, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [roomId, employeeId, normalizedTitle, normalizedDescription, startTimeSql, endTimeSql, status]
    );

    await connection.commit();
    return res.status(201).json({
      message: "Booking created successfully.",
      booking_id: insertResult.insertId
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // no-op
    }
    throw error;
  } finally {
    connection.release();
  }
});

const updateBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  const requestedTitle = req.body?.title;
  const requestedDescription = req.body?.description;
  const requestedStartTime = req.body?.start_time;
  const requestedEndTime = req.body?.end_time;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.execute(
      `
        SELECT booking_id, room_id, employee_id, title, description, start_time, end_time, status
        FROM booking
        WHERE booking_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Booking not found." });
    }

    const existingBooking = bookingRows[0];
    if (!canManageBooking(req, existingBooking.employee_id)) {
      await connection.rollback();
      return res.status(403).json({ message: "You do not have permission to edit this booking." });
    }

    if (String(existingBooking.status).toLowerCase() === "cancelled") {
      await connection.rollback();
      return res.status(400).json({ message: "Cancelled bookings cannot be edited." });
    }

    const roomId = parsePositiveInt(existingBooking.room_id);
    const title = requestedTitle ? String(requestedTitle).trim() : String(existingBooking.title || "");
    const description = requestedDescription
      ? String(requestedDescription).trim()
      : String(existingBooking.description || "");
    const startTimeSql = requestedStartTime
      ? normalizeDateTimeForMySql(requestedStartTime)
      : normalizeDateTimeForMySql(existingBooking.start_time);
    const endTimeSql = requestedEndTime
      ? normalizeDateTimeForMySql(requestedEndTime)
      : normalizeDateTimeForMySql(existingBooking.end_time);

    if (!roomId || !title || !description || !startTimeSql || !endTimeSql) {
      await connection.rollback();
      return res.status(400).json({ message: "title, description, start_time, end_time are required." });
    }

    if (endTimeSql <= startTimeSql) {
      await connection.rollback();
      return res.status(400).json({ message: "end_time must be greater than start_time." });
    }

    const startDate = parseMySqlUtcToDate(startTimeSql);
    if (!startDate || startDate.getTime() < Date.now()) {
      await connection.rollback();
      return res.status(400).json({ message: "You can only edit future bookings." });
    }

    const [conflictRows] = await connection.execute(
      `
        SELECT booking_id
        FROM booking
        WHERE room_id = ?
          AND booking_id <> ?
          AND status IN ('confirmed', 'pending')
          AND start_time < ?
          AND end_time > ?
        LIMIT 1
        FOR UPDATE
      `,
      [roomId, bookingId, endTimeSql, startTimeSql]
    );

    if (conflictRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Room is already booked for the selected time slot." });
    }

    await connection.execute(
      `
        UPDATE booking
        SET title = ?, description = ?, start_time = ?, end_time = ?
        WHERE booking_id = ?
      `,
      [title, description, startTimeSql, endTimeSql, bookingId]
    );

    await connection.commit();
    return res.json({
      message: "Booking updated successfully.",
      booking: {
        booking_id: bookingId,
        room_id: roomId,
        title,
        description,
        start_time: startTimeSql,
        end_time: endTimeSql
      }
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // no-op
    }
    throw error;
  } finally {
    connection.release();
  }
});

const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.execute(
      `
        SELECT booking_id, employee_id, start_time, status
        FROM booking
        WHERE booking_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Booking not found." });
    }

    const existingBooking = bookingRows[0];
    if (!canManageBooking(req, existingBooking.employee_id)) {
      await connection.rollback();
      return res.status(403).json({ message: "You do not have permission to cancel this booking." });
    }

    if (String(existingBooking.status).toLowerCase() === "cancelled") {
      await connection.rollback();
      return res.json({ message: "Booking is already cancelled." });
    }

    const startDate = parseMySqlUtcToDate(normalizeDateTimeForMySql(existingBooking.start_time));
    if (!startDate || startDate.getTime() < Date.now()) {
      await connection.rollback();
      return res.status(400).json({ message: "Only future bookings can be cancelled." });
    }

    await connection.execute(
      `
        UPDATE booking
        SET status = 'cancelled'
        WHERE booking_id = ?
      `,
      [bookingId]
    );

    await connection.commit();
    return res.json({ message: "Booking cancelled successfully." });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // no-op
    }
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  getUpcomingBookings,
  getBookingSummary,
  getBookingReports,
  createBooking,
  updateBooking,
  cancelBooking
};
