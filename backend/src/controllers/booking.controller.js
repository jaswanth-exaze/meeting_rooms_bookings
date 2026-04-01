// Handle booking API helpers and route actions.

const asyncHandler = require("../middleware/asyncHandler");
const { query, pool } = require("../config/db");
const logger = require("../utils/logger");

// Parse a positive integer from the provided value.
function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

// Clamp limit values to the supported range.
function normalizeLimit(value, fallback, max) {
  const parsed = parsePositiveInt(value);
  if (!parsed) return fallback;
  return Math.min(parsed, max);
}

// Normalize date-time input into a MySQL-friendly UTC string.
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

// Convert a MySQL UTC date value into a JavaScript Date.
function parseMySqlUtcToDate(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

// Normalize loosely typed truthy values into a boolean.
function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

// Define shared constants used throughout this module.
const BOOKING_PAST_GRACE_MS = 60 * 1000;

// Return whether is past beyond grace.
function isPastBeyondGrace(dateValue, graceMs = BOOKING_PAST_GRACE_MS) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return true;
  }

  return dateValue.getTime() < Date.now() - graceMs;
}

// Return employee scope.
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

// Return whether can manage booking.
function canManageBooking(req, bookingEmployeeId) {
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const targetEmployeeId = parsePositiveInt(bookingEmployeeId);
  const isAdmin = req.user?.is_admin === true;

  if (!authEmployeeId || !targetEmployeeId) return false;
  if (isAdmin) return true;
  return authEmployeeId === targetEmployeeId;
}

// Build booking visibility condition.
function buildBookingVisibilityCondition(params, employeeId) {
  params.push(employeeId, employeeId);
  return `
    (
      b.employee_id = ?
      OR EXISTS (
        SELECT 1
        FROM booking_participants scope_bp
        WHERE scope_bp.booking_id = b.booking_id
          AND scope_bp.employee_id = ?
      )
    )
  `;
}

// Shape a booking row into the API payload returned to clients.
function serializeBookingRow(row) {
  if (!row || typeof row !== "object") return row;

  return {
    ...row,
    booking_id: Number(row.booking_id || 0),
    room_id: Number(row.room_id || 0),
    employee_id: Number(row.employee_id || row.organizer_employee_id || 0),
    organizer_employee_id: Number(row.organizer_employee_id || row.employee_id || 0),
    room_capacity: Number(row.room_capacity || 0),
    participant_count: Number(row.participant_count || 0),
    is_organizer: toBoolean(row.is_organizer)
  };
}

// Normalize participant employee ids before persistence checks.
function normalizeParticipantEmployeeIds(rawParticipantEmployeeIds, organizerEmployeeId) {
  if (rawParticipantEmployeeIds === undefined) {
    return {
      provided: false,
      ids: [],
      hadDuplicates: false,
      excludedOrganizer: false
    };
  }

  if (!Array.isArray(rawParticipantEmployeeIds)) {
    return {
      error: "participant_employee_ids must be an array of employee ids."
    };
  }

  const participantIds = [];
  const seenParticipantIds = new Set();
  let hadDuplicates = false;
  let excludedOrganizer = false;

  for (const rawEmployeeId of rawParticipantEmployeeIds) {
    const participantEmployeeId = parsePositiveInt(rawEmployeeId);
    if (!participantEmployeeId) {
      return {
        error: "participant_employee_ids must contain only positive employee ids."
      };
    }

    if (participantEmployeeId === organizerEmployeeId) {
      excludedOrganizer = true;
      continue;
    }

    if (seenParticipantIds.has(participantEmployeeId)) {
      hadDuplicates = true;
      continue;
    }

    seenParticipantIds.add(participantEmployeeId);
    participantIds.push(participantEmployeeId);
  }

  return {
    provided: true,
    ids: participantIds,
    hadDuplicates,
    excludedOrganizer
  };
}

// Build SQL placeholder markup for the provided values.
function buildSqlPlaceholders(values) {
  return values.map(() => "?").join(", ");
}

// Return unique positive integers from the provided values.
function getUniquePositiveIntValues(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map(value => parsePositiveInt(value))
        .filter(value => value !== null)
    )
  ).sort((left, right) => left - right);
}

// Fetch employees by IDs.
async function fetchEmployeesByIds(connection, employeeIds, { onlyActive = false } = {}) {
  const normalizedEmployeeIds = getUniquePositiveIntValues(employeeIds);
  if (!normalizedEmployeeIds.length) {
    return [];
  }

  const placeholders = buildSqlPlaceholders(normalizedEmployeeIds);
  const activeCondition = onlyActive ? " AND is_active = 1" : "";
  const [rows] = await connection.execute(
    `
      SELECT employee_id, name, email, department, project, role, work_location_id, is_active
      FROM employee
      WHERE employee_id IN (${placeholders})
        ${activeCondition}
      ORDER BY name ASC, email ASC
    `,
    normalizedEmployeeIds
  );

  return rows.map(row => ({
    employee_id: Number(row.employee_id || 0),
    name: row.name || null,
    email: row.email || null,
    department: row.department || null,
    project: row.project || null,
    role: row.role || null,
    work_location_id: row.work_location_id ? Number(row.work_location_id) : null,
    is_active: toBoolean(row.is_active)
  }));
}

// Fetch active employees by IDs.
async function fetchActiveEmployeesByIds(connection, employeeIds) {
  return fetchEmployeesByIds(connection, employeeIds, { onlyActive: true });
}

// Lock employees for scheduling.
async function lockEmployeesForScheduling(connection, employeeIds) {
  const normalizedEmployeeIds = getUniquePositiveIntValues(employeeIds);
  if (!normalizedEmployeeIds.length) {
    return;
  }

  const placeholders = buildSqlPlaceholders(normalizedEmployeeIds);
  await connection.execute(
    `
      SELECT employee_id
      FROM employee
      WHERE employee_id IN (${placeholders})
      ORDER BY employee_id ASC
      FOR UPDATE
    `,
    normalizedEmployeeIds
  );
}

// Find employee scheduling conflicts.
async function findEmployeeSchedulingConflicts(connection, employeeIds, startTimeSql, endTimeSql, options = {}) {
  const normalizedEmployeeIds = getUniquePositiveIntValues(employeeIds);
  if (!normalizedEmployeeIds.length || !startTimeSql || !endTimeSql) {
    return [];
  }

  const excludeBookingId = parsePositiveInt(options.excludeBookingId);
  const placeholders = buildSqlPlaceholders(normalizedEmployeeIds);
  const excludeCondition = excludeBookingId ? " AND b.booking_id <> ?" : "";
  const params = [
    endTimeSql,
    startTimeSql,
    ...(excludeBookingId ? [excludeBookingId] : []),
    ...normalizedEmployeeIds,
    endTimeSql,
    startTimeSql,
    ...(excludeBookingId ? [excludeBookingId] : []),
    ...normalizedEmployeeIds
  ];

  const [rows] = await connection.execute(
    `
      WITH employee_conflicts AS (
        SELECT
          conflict.employee_id,
          conflict.booking_id,
          conflict.title,
          conflict.start_time,
          conflict.end_time,
          conflict.organizer_employee_id,
          conflict.organizer_name,
          conflict.involvement_role,
          ROW_NUMBER() OVER (
            PARTITION BY conflict.employee_id
            ORDER BY conflict.start_time ASC, conflict.booking_id ASC
          ) AS conflict_rank
        FROM (
          SELECT
            b.employee_id AS employee_id,
            b.booking_id,
            b.title,
            b.start_time,
            b.end_time,
            b.employee_id AS organizer_employee_id,
            organizer.name AS organizer_name,
            'organizer' AS involvement_role
          FROM booking b
          INNER JOIN employee organizer ON organizer.employee_id = b.employee_id
          WHERE b.status IN ('confirmed', 'pending')
            AND b.start_time < ?
            AND b.end_time > ?
            ${excludeCondition}
            AND b.employee_id IN (${placeholders})

          UNION ALL

          SELECT
            bp.employee_id AS employee_id,
            b.booking_id,
            b.title,
            b.start_time,
            b.end_time,
            b.employee_id AS organizer_employee_id,
            organizer.name AS organizer_name,
            'participant' AS involvement_role
          FROM booking b
          INNER JOIN booking_participants bp ON bp.booking_id = b.booking_id
          INNER JOIN employee organizer ON organizer.employee_id = b.employee_id
          WHERE b.status IN ('confirmed', 'pending')
            AND b.start_time < ?
            AND b.end_time > ?
            ${excludeCondition}
            AND bp.employee_id IN (${placeholders})
        ) conflict
      )
      SELECT
        employee_id,
        booking_id,
        title,
        start_time,
        end_time,
        organizer_employee_id,
        organizer_name,
        involvement_role
      FROM employee_conflicts
      WHERE conflict_rank = 1
      ORDER BY employee_id ASC
    `,
    params
  );

  return rows.map(row => ({
    employee_id: Number(row.employee_id || 0),
    booking_id: Number(row.booking_id || 0),
    title: row.title || null,
    start_time: row.start_time || null,
    end_time: row.end_time || null,
    organizer_employee_id: Number(row.organizer_employee_id || 0),
    organizer_name: row.organizer_name || null,
    involvement_role: row.involvement_role || "participant"
  }));
}

// Build a readable message describing booking conflicts.
function buildSchedulingConflictMessage(conflicts, organizerEmployeeId) {
  if (!Array.isArray(conflicts) || !conflicts.length) {
    return "One or more attendees are not available during this time.";
  }

  const firstConflict = conflicts[0];
  const conflictTitle = firstConflict.conflicting_booking_title
    ? ` "${firstConflict.conflicting_booking_title}"`
    : "";

  if (firstConflict.employee_id === organizerEmployeeId) {
    return `You are not available during this time because you already have another meeting${conflictTitle}.`;
  }

  if (conflicts.length === 1) {
    return `${firstConflict.name} is not available during this time because they already have another meeting${conflictTitle}.`;
  }

  const previewNames = conflicts
    .slice(0, 3)
    .map(conflict => conflict.name)
    .filter(Boolean)
    .join(", ");

  return `Some selected employees are not available during this time: ${previewNames}.`;
}

// Validate employee scheduling availability.
async function validateEmployeeSchedulingAvailability(connection, employeeRows, startTimeSql, endTimeSql, options = {}) {
  const attendees = Array.isArray(employeeRows)
    ? employeeRows.filter(
        row => row && Number.isFinite(Number(row.employee_id)) && Number(row.employee_id) > 0
      )
    : [];
  const attendeeIds = getUniquePositiveIntValues(attendees.map(row => row.employee_id));

  const conflictRows = await findEmployeeSchedulingConflicts(connection, attendeeIds, startTimeSql, endTimeSql, options);
  if (!conflictRows.length) {
    return { conflicts: [] };
  }

  const attendeeById = new Map(
    attendees.map(row => [
      Number(row.employee_id),
      {
        employee_id: Number(row.employee_id),
        name: row.name || `Employee #${Number(row.employee_id)}`,
        email: row.email || null
      }
    ])
  );

  const conflicts = conflictRows.map(conflict => {
    const attendee = attendeeById.get(Number(conflict.employee_id));
    return {
      employee_id: Number(conflict.employee_id),
      name: attendee?.name || `Employee #${Number(conflict.employee_id)}`,
      email: attendee?.email || null,
      involvement_role: conflict.involvement_role,
      conflicting_booking_id: Number(conflict.booking_id),
      conflicting_booking_title: conflict.title || null,
      conflicting_start_time: conflict.start_time || null,
      conflicting_end_time: conflict.end_time || null,
      conflicting_organizer_name: conflict.organizer_name || null
    };
  });

  return {
    error: {
      status: 409,
      message: buildSchedulingConflictMessage(conflicts, parsePositiveInt(options.organizerEmployeeId)),
      conflicts
    }
  };
}

// Fetch booking participants.
async function fetchBookingParticipants(connection, bookingId) {
  const [rows] = await connection.execute(
    `
      SELECT
        bp.booking_participant_id,
        bp.booking_id,
        bp.employee_id,
        e.name,
        e.email,
        e.department,
        bp.added_by_employee_id,
        added_by.name AS added_by_name,
        bp.created_at
      FROM booking_participants bp
      INNER JOIN employee e ON e.employee_id = bp.employee_id
      LEFT JOIN employee added_by ON added_by.employee_id = bp.added_by_employee_id
      WHERE bp.booking_id = ?
      ORDER BY e.name ASC, e.email ASC, bp.booking_participant_id ASC
    `,
    [bookingId]
  );

  return rows.map(row => ({
    booking_participant_id: Number(row.booking_participant_id || 0),
    booking_id: Number(row.booking_id || bookingId || 0),
    employee_id: Number(row.employee_id || 0),
    name: row.name || null,
    email: row.email || null,
    department: row.department || null,
    added_by_employee_id: row.added_by_employee_id ? Number(row.added_by_employee_id) : null,
    added_by_name: row.added_by_name || null,
    created_at: row.created_at || null
  }));
}

// Insert booking participants.
async function insertBookingParticipants(connection, bookingId, participantIds, actorEmployeeId) {
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return;
  }

  for (const participantEmployeeId of participantIds) {
    await connection.execute(
      `
        INSERT INTO booking_participants (booking_id, employee_id, added_by_employee_id)
        VALUES (?, ?, ?)
      `,
      [bookingId, participantEmployeeId, actorEmployeeId]
    );
  }
}

// Sync booking participants.
async function syncBookingParticipants(connection, bookingId, nextParticipantIds, actorEmployeeId) {
  const existingParticipants = await fetchBookingParticipants(connection, bookingId);
  const existingParticipantIds = existingParticipants.map(participant => Number(participant.employee_id));
  const nextParticipantSet = new Set(nextParticipantIds);
  const existingParticipantSet = new Set(existingParticipantIds);

  const addedParticipantIds = nextParticipantIds.filter(employeeId => !existingParticipantSet.has(employeeId));
  const removedParticipantIds = existingParticipantIds.filter(employeeId => !nextParticipantSet.has(employeeId));

  if (removedParticipantIds.length > 0) {
    const placeholders = buildSqlPlaceholders(removedParticipantIds);
    await connection.execute(
      `
        DELETE FROM booking_participants
        WHERE booking_id = ?
          AND employee_id IN (${placeholders})
      `,
      [bookingId, ...removedParticipantIds]
    );
  }

  await insertBookingParticipants(connection, bookingId, addedParticipantIds, actorEmployeeId);

  return {
    existingParticipants,
    addedParticipantIds,
    removedParticipantIds
  };
}

// Normalize booking status values to the supported set.
function normalizeStatus(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

// Insert booking audit.
async function insertBookingAudit(connection, details) {
  const bookingId = parsePositiveInt(details.booking_id);
  const actorEmployeeId = parsePositiveInt(details.actor_employee_id);
  const action = String(details.action || "")
    .trim()
    .toLowerCase();

  if (!bookingId || !actorEmployeeId || !action) {
    return;
  }

  const allowedActions = new Set(["created", "updated", "cancelled", "vacated"]);
  if (!allowedActions.has(action)) {
    return;
  }

  const metadata = details.metadata && typeof details.metadata === "object" ? JSON.stringify(details.metadata) : null;
  try {
    await connection.execute(
      `
        INSERT INTO booking_audit (
          booking_id,
          action,
          actor_employee_id,
          previous_status,
          new_status,
          previous_start_time,
          previous_end_time,
          new_start_time,
          new_end_time,
          metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        bookingId,
        action,
        actorEmployeeId,
        details.previous_status || null,
        details.new_status || null,
        details.previous_start_time || null,
        details.previous_end_time || null,
        details.new_start_time || null,
        details.new_end_time || null,
        metadata
      ]
    );
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.code === "ER_BAD_FIELD_ERROR") {
      return;
    }
    throw error;
  }
}

// Return upcoming bookings visible to the current user.
const getUpcomingBookings = asyncHandler(async (req, res) => {
  const scope = getEmployeeScope(req, req.query.employee_id);
  if (scope.error) {
    return res.status(401).json({ message: scope.error });
  }

  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const limit = normalizeLimit(req.query.limit, 20, 200);
  const includePast = toBoolean(req.query.include_past);
  const includeCancelled = toBoolean(req.query.include_cancelled);
  const statuses = includeCancelled
    ? ["confirmed", "pending", "cancelled", "vacated"]
    : ["confirmed", "pending", "vacated"];

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
      b.employee_id AS organizer_employee_id,
      e.name AS employee_name,
      e.name AS organizer_name,
      CASE WHEN b.employee_id = ? THEN 1 ELSE 0 END AS is_organizer,
      COALESCE(bp_counts.participant_count, 0) AS participant_count,
      mr.room_id,
      mr.name AS room_name,
      mr.capacity AS room_capacity,
      l.location_id,
      l.name AS location_name,
      l.timezone AS location_timezone
    FROM booking b
    INNER JOIN employee e ON e.employee_id = b.employee_id
    INNER JOIN meeting_room mr ON mr.room_id = b.room_id
    INNER JOIN location l ON l.location_id = mr.location_id
    LEFT JOIN (
      SELECT booking_id, COUNT(*) AS participant_count
      FROM booking_participants
      GROUP BY booking_id
    ) bp_counts ON bp_counts.booking_id = b.booking_id
    WHERE b.status IN (${statusPlaceholders})
  `;

  const params = [authEmployeeId, ...statuses];

  if (!includePast) {
    sql += " AND b.start_time >= UTC_TIMESTAMP()";
  }

  if (!scope.includeAll) {
    sql += ` AND ${buildBookingVisibilityCondition(params, scope.employeeId)}`;
  }

  sql += includePast ? " ORDER BY b.start_time DESC" : " ORDER BY b.start_time ASC";
  sql += ` LIMIT ${limit}`;

  const rows = await query(sql, params);
  res.json(rows.map(serializeBookingRow));
});

// Return booking summary metrics for the dashboard.
const getBookingSummary = asyncHandler(async (req, res) => {
  const scope = getEmployeeScope(req, req.query.employee_id);
  if (scope.error) {
    return res.status(401).json({ message: scope.error });
  }

  const whereParams = [];
  const whereClause = scope.includeAll ? "" : `WHERE ${buildBookingVisibilityCondition(whereParams, scope.employeeId)}`;

  const summaryRows = await query(
    `
      SELECT
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN DATE(b.start_time) = UTC_DATE() AND b.status IN ('confirmed', 'pending', 'vacated') THEN 1 ELSE 0 END) AS rooms_booked_today,
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
            WHEN DATE(b.start_time) = UTC_DATE() AND b.status IN ('confirmed', 'vacated')
            THEN TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time)
            ELSE 0
          END
        ) AS booked_minutes_today,
        SUM(
          CASE
            WHEN b.start_time >= UTC_TIMESTAMP()
             AND b.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)
             AND b.status IN ('confirmed', 'vacated')
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

// Return the details for a single booking.
const getBookingById = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const isAdmin = req.user?.is_admin === true;

  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }

  if (!authEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  let sql = `
    SELECT
      b.booking_id,
      b.room_id,
      b.title,
      b.description,
      b.start_time,
      b.end_time,
      b.status,
      b.employee_id,
      b.employee_id AS organizer_employee_id,
      e.name AS employee_name,
      e.name AS organizer_name,
      CASE WHEN b.employee_id = ? THEN 1 ELSE 0 END AS is_organizer,
      COALESCE(bp_counts.participant_count, 0) AS participant_count,
      mr.name AS room_name,
      mr.capacity AS room_capacity,
      l.location_id,
      l.name AS location_name,
      l.timezone AS location_timezone
    FROM booking b
    INNER JOIN employee e ON e.employee_id = b.employee_id
    INNER JOIN meeting_room mr ON mr.room_id = b.room_id
    INNER JOIN location l ON l.location_id = mr.location_id
    LEFT JOIN (
      SELECT booking_id, COUNT(*) AS participant_count
      FROM booking_participants
      GROUP BY booking_id
    ) bp_counts ON bp_counts.booking_id = b.booking_id
    WHERE b.booking_id = ?
  `;

  const params = [authEmployeeId, bookingId];
  if (!isAdmin) {
    sql += ` AND ${buildBookingVisibilityCondition(params, authEmployeeId)}`;
  }

  sql += " LIMIT 1";

  const rows = await query(sql, params);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Booking not found." });
  }

  const participants = await fetchBookingParticipants(pool, bookingId);
  const booking = serializeBookingRow(rows[0]);

  return res.json({
    booking: {
      ...booking,
      participants
    }
  });
});

// Return aggregated booking reports for the admin dashboard.
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
        l.name AS location_name,
        l.timezone AS location_timezone
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

// Create a booking after validating participants and conflicts.
const createBooking = asyncHandler(async (req, res) => {
  const { room_id, employee_id, title, description, start_time, end_time } = req.body || {};
  const status = req.body?.status || "confirmed";

  const roomId = parsePositiveInt(room_id);
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const requestedEmployeeId = parsePositiveInt(employee_id);
  const isAdmin = req.user?.is_admin === true;
  const employeeId = isAdmin ? requestedEmployeeId || authEmployeeId : authEmployeeId;
  const normalizedParticipants = normalizeParticipantEmployeeIds(req.body?.participant_employee_ids, employeeId);
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

  if (normalizedParticipants.error) {
    return res.status(400).json({ message: normalizedParticipants.error });
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

  if (isPastBeyondGrace(startDate)) {
    return res.status(400).json({ message: "You cannot book for past date/time." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const organizerRows = await fetchActiveEmployeesByIds(connection, [employeeId]);
    if (organizerRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Organizer employee is invalid or inactive." });
    }

    const participantRows = await fetchActiveEmployeesByIds(connection, normalizedParticipants.ids);
    if (participantRows.length !== normalizedParticipants.ids.length) {
      await connection.rollback();
      return res.status(400).json({ message: "One or more participant employees are invalid or inactive." });
    }

    const attendeeRows = [organizerRows[0], ...participantRows];
    const attendeeIds = attendeeRows.map(row => Number(row.employee_id));
    await lockEmployeesForScheduling(connection, attendeeIds);

    const [roomRows] = await connection.execute(
      `
        SELECT room_id, capacity
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

    const roomCapacity = Number(roomRows[0]?.capacity || 0);
    if (roomCapacity > 0 && normalizedParticipants.ids.length + 1 > roomCapacity) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: `Total attendees cannot exceed room capacity of ${roomCapacity}.` });
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

    const schedulingValidation = await validateEmployeeSchedulingAvailability(
      connection,
      attendeeRows,
      startTimeSql,
      endTimeSql,
      { organizerEmployeeId: employeeId }
    );

    if (schedulingValidation.error) {
      await connection.rollback();
      return res
        .status(schedulingValidation.error.status)
        .json({ message: schedulingValidation.error.message, conflicts: schedulingValidation.error.conflicts });
    }

    const [insertResult] = await connection.execute(
      `
        INSERT INTO booking (room_id, employee_id, title, description, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [roomId, employeeId, normalizedTitle, normalizedDescription, startTimeSql, endTimeSql, status]
    );

    await insertBookingParticipants(connection, insertResult.insertId, normalizedParticipants.ids, authEmployeeId);

    await insertBookingAudit(connection, {
      booking_id: insertResult.insertId,
      action: "created",
      actor_employee_id: authEmployeeId,
      previous_status: null,
      new_status: status,
      previous_start_time: null,
      previous_end_time: null,
      new_start_time: startTimeSql,
      new_end_time: endTimeSql,
      metadata: {
        participant_count: normalizedParticipants.ids.length,
        total_attendees: normalizedParticipants.ids.length + 1,
        participant_employee_ids: normalizedParticipants.ids,
        organizer_removed_from_participants: normalizedParticipants.excludedOrganizer,
        duplicate_participants_removed: normalizedParticipants.hadDuplicates
      }
    });

    logger.info("booking_created", {
      booking_id: insertResult.insertId,
      organizer_employee_id: employeeId,
      actor_employee_id: authEmployeeId,
      room_id: roomId,
      participant_count: normalizedParticipants.ids.length,
      total_attendees: normalizedParticipants.ids.length + 1
    });

    await connection.commit();
    return res.status(201).json({
      message: "Booking created successfully.",
      booking_id: insertResult.insertId,
      participant_count: normalizedParticipants.ids.length
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

// Update an existing booking after validating the new details.
const updateBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  const actorEmployeeId = parsePositiveInt(req.user?.employee_id);
  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }
  if (!actorEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
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

    const existingStatus = normalizeStatus(existingBooking.status);
    if (existingStatus === "cancelled") {
      await connection.rollback();
      return res.status(400).json({ message: "Cancelled bookings cannot be edited." });
    }
    if (existingStatus === "vacated") {
      await connection.rollback();
      return res.status(400).json({ message: "Vacated bookings cannot be edited." });
    }

    const normalizedParticipants = normalizeParticipantEmployeeIds(
      req.body?.participant_employee_ids,
      Number(existingBooking.employee_id)
    );
    if (normalizedParticipants.error) {
      await connection.rollback();
      return res.status(400).json({ message: normalizedParticipants.error });
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
    if (isPastBeyondGrace(startDate)) {
      await connection.rollback();
      return res.status(400).json({ message: "You can only edit future bookings." });
    }

    const organizerRows = await fetchEmployeesByIds(connection, [existingBooking.employee_id]);
    if (organizerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Organizer employee was not found." });
    }

    const existingParticipants = await fetchBookingParticipants(connection, bookingId);
    let nextParticipantRows = existingParticipants.map(participant => ({
      employee_id: Number(participant.employee_id || 0),
      name: participant.name || null,
      email: participant.email || null,
      department: participant.department || null
    }));

    if (normalizedParticipants.provided) {
      nextParticipantRows = await fetchActiveEmployeesByIds(connection, normalizedParticipants.ids);
      if (nextParticipantRows.length !== normalizedParticipants.ids.length) {
        await connection.rollback();
        return res.status(400).json({ message: "One or more participant employees are invalid or inactive." });
      }
    }

    const attendeeRows = [organizerRows[0], ...nextParticipantRows];
    const attendeeIds = attendeeRows.map(row => Number(row.employee_id));
    await lockEmployeesForScheduling(connection, attendeeIds);

    const [roomRows] = await connection.execute(
      `
        SELECT room_id, capacity
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

    const roomCapacity = Number(roomRows[0]?.capacity || 0);
    if (normalizedParticipants.provided && roomCapacity > 0 && normalizedParticipants.ids.length + 1 > roomCapacity) {
      await connection.rollback();
      return res.status(400).json({ message: `Total attendees cannot exceed room capacity of ${roomCapacity}.` });
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

    const schedulingValidation = await validateEmployeeSchedulingAvailability(
      connection,
      attendeeRows,
      startTimeSql,
      endTimeSql,
      {
        excludeBookingId: bookingId,
        organizerEmployeeId: Number(existingBooking.employee_id)
      }
    );

    if (schedulingValidation.error) {
      await connection.rollback();
      return res
        .status(schedulingValidation.error.status)
        .json({ message: schedulingValidation.error.message, conflicts: schedulingValidation.error.conflicts });
    }

    let participantAuditChanges = null;
    if (normalizedParticipants.provided) {
      participantAuditChanges = await syncBookingParticipants(
        connection,
        bookingId,
        normalizedParticipants.ids,
        actorEmployeeId
      );
    }

    await connection.execute(
      `
        UPDATE booking
        SET title = ?, description = ?, start_time = ?, end_time = ?
        WHERE booking_id = ?
      `,
      [title, description, startTimeSql, endTimeSql, bookingId]
    );

    await insertBookingAudit(connection, {
      booking_id: bookingId,
      action: "updated",
      actor_employee_id: actorEmployeeId,
      previous_status: existingStatus,
      new_status: existingStatus,
      previous_start_time: normalizeDateTimeForMySql(existingBooking.start_time),
      previous_end_time: normalizeDateTimeForMySql(existingBooking.end_time),
      new_start_time: startTimeSql,
      new_end_time: endTimeSql,
      metadata: {
        participant_count: normalizedParticipants.provided
          ? normalizedParticipants.ids.length
          : undefined,
        participant_added_ids: participantAuditChanges?.addedParticipantIds || [],
        participant_removed_ids: participantAuditChanges?.removedParticipantIds || [],
        duplicate_participants_removed: normalizedParticipants.hadDuplicates,
        organizer_removed_from_participants: normalizedParticipants.excludedOrganizer
      }
    });

    if (participantAuditChanges) {
      logger.info("booking_participants_updated", {
        booking_id: bookingId,
        actor_employee_id: actorEmployeeId,
        added_employee_ids: participantAuditChanges.addedParticipantIds,
        removed_employee_ids: participantAuditChanges.removedParticipantIds,
        participant_count_before: participantAuditChanges.existingParticipants.length,
        participant_count_after: normalizedParticipants.ids.length
      });
    }

    let finalParticipantCount = normalizedParticipants.provided ? normalizedParticipants.ids.length : null;
    if (finalParticipantCount === null) {
      const [participantCountRows] = await connection.execute(
        `
          SELECT COUNT(*) AS participant_count
          FROM booking_participants
          WHERE booking_id = ?
        `,
        [bookingId]
      );
      finalParticipantCount = Number(participantCountRows[0]?.participant_count || 0);
    }

    await connection.commit();
    return res.json({
      message: "Booking updated successfully.",
      booking: {
        booking_id: bookingId,
        room_id: roomId,
        title,
        description,
        start_time: startTimeSql,
        end_time: endTimeSql,
        participant_count: finalParticipantCount
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

// Cancel a future booking if the user is allowed to manage it.
const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  const actorEmployeeId = parsePositiveInt(req.user?.employee_id);
  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }
  if (!actorEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.execute(
      `
        SELECT booking_id, employee_id, start_time, end_time, status
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

    const existingStatus = normalizeStatus(existingBooking.status);
    if (existingStatus === "cancelled") {
      await connection.rollback();
      return res.json({ message: "Booking is already cancelled." });
    }
    if (existingStatus === "vacated") {
      await connection.rollback();
      return res.status(400).json({ message: "Vacated bookings cannot be cancelled." });
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

    await insertBookingAudit(connection, {
      booking_id: bookingId,
      action: "cancelled",
      actor_employee_id: actorEmployeeId,
      previous_status: existingStatus,
      new_status: "cancelled",
      previous_start_time: normalizeDateTimeForMySql(existingBooking.start_time),
      previous_end_time: normalizeDateTimeForMySql(existingBooking.end_time),
      new_start_time: normalizeDateTimeForMySql(existingBooking.start_time),
      new_end_time: normalizeDateTimeForMySql(existingBooking.end_time)
    });

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

// Mark an active booking as vacated when the room is freed early.
const vacateBooking = asyncHandler(async (req, res) => {
  const bookingId = parsePositiveInt(req.params.bookingId);
  const actorEmployeeId = parsePositiveInt(req.user?.employee_id);
  if (!bookingId) {
    return res.status(400).json({ message: "Invalid booking id." });
  }
  if (!actorEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingRows] = await connection.execute(
      `
        SELECT booking_id, employee_id, start_time, end_time, status
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
      return res.status(403).json({ message: "You do not have permission to vacate this booking." });
    }

    const existingStatus = normalizeStatus(existingBooking.status);
    if (existingStatus === "cancelled") {
      await connection.rollback();
      return res.status(400).json({ message: "Cancelled bookings cannot be vacated." });
    }
    if (existingStatus === "vacated") {
      await connection.rollback();
      return res.json({ message: "Booking is already vacated." });
    }

    const startTimeSql = normalizeDateTimeForMySql(existingBooking.start_time);
    const endTimeSql = normalizeDateTimeForMySql(existingBooking.end_time);
    const startDate = parseMySqlUtcToDate(startTimeSql);
    const endDate = parseMySqlUtcToDate(endTimeSql);

    if (!startDate || !endDate || !startTimeSql || !endTimeSql) {
      await connection.rollback();
      return res.status(400).json({ message: "Booking has invalid timing data." });
    }

    const now = new Date();
    if (now.getTime() < startDate.getTime()) {
      await connection.rollback();
      return res.status(400).json({ message: "Only ongoing bookings can be vacated." });
    }

    if (now.getTime() >= endDate.getTime()) {
      await connection.rollback();
      return res.json({ message: "Booking is already completed." });
    }

    const nowSql = normalizeDateTimeForMySql(now.toISOString());
    if (!nowSql || nowSql <= startTimeSql) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "Booking has just started. Please try vacating again in a few seconds." });
    }

    await connection.execute(
      `
        UPDATE booking
        SET end_time = ?, status = 'vacated'
        WHERE booking_id = ?
      `,
      [nowSql, bookingId]
    );

    await insertBookingAudit(connection, {
      booking_id: bookingId,
      action: "vacated",
      actor_employee_id: actorEmployeeId,
      previous_status: existingStatus,
      new_status: "vacated",
      previous_start_time: startTimeSql,
      previous_end_time: endTimeSql,
      new_start_time: startTimeSql,
      new_end_time: nowSql
    });

    await connection.commit();
    return res.json({
      message: "Booking vacated successfully.",
      booking: {
        booking_id: bookingId,
        status: "vacated",
        end_time: nowSql
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

module.exports = {
  getUpcomingBookings,
  getBookingSummary,
  getBookingById,
  getBookingReports,
  createBooking,
  updateBooking,
  cancelBooking,
  vacateBooking
};
