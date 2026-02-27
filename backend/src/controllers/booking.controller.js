const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");

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

const getUpcomingBookings = asyncHandler(async (req, res) => {
  const scope = getEmployeeScope(req, req.query.employee_id);
  if (scope.error) {
    return res.status(401).json({ message: scope.error });
  }

  const limit = normalizeLimit(req.query.limit, 20, 100);

  let sql = `
    SELECT
      b.booking_id,
      b.title,
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
    WHERE b.start_time >= UTC_TIMESTAMP()
      AND b.status IN ('confirmed', 'pending')
  `;

  const params = [];
  if (!scope.includeAll) {
    sql += " AND b.employee_id = ?";
    params.push(scope.employeeId);
  }

  // Avoid prepared placeholder in LIMIT for MySQL variants that reject it.
  sql += ` ORDER BY b.start_time ASC LIMIT ${limit}`;

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
        SUM(CASE WHEN DATE(b.start_time) = UTC_DATE() AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS rooms_booked_today,
        SUM(CASE WHEN b.start_time >= UTC_TIMESTAMP() AND b.status IN ('confirmed', 'pending') THEN 1 ELSE 0 END) AS upcoming_meetings,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS open_requests,
        SUM(CASE WHEN DATE(b.start_time) = UTC_DATE() AND b.status = 'confirmed' THEN TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) ELSE 0 END) AS booked_minutes_today
      FROM booking b
      ${whereClause}
    `,
    whereParams
  );

  const roomRows = await query("SELECT COUNT(*) AS total_rooms FROM meeting_room");
  const totalRooms = Number(roomRows[0]?.total_rooms || 0);
  const bookedMinutesToday = Number(summaryRows[0]?.booked_minutes_today || 0);
  const totalWorkdayMinutes = totalRooms * 9 * 60;
  const utilization = totalWorkdayMinutes > 0 ? Math.min(100, Math.round((bookedMinutesToday / totalWorkdayMinutes) * 100)) : 0;

  res.json({
    rooms_booked_today: Number(summaryRows[0]?.rooms_booked_today || 0),
    upcoming_meetings: Number(summaryRows[0]?.upcoming_meetings || 0),
    open_requests: Number(summaryRows[0]?.open_requests || 0),
    utilization_percent: utilization
  });
});

const createBooking = asyncHandler(async (req, res) => {
  const { room_id, employee_id, title, start_time, end_time } = req.body || {};
  const status = req.body?.status || "confirmed";

  const roomId = parsePositiveInt(room_id);
  const authEmployeeId = parsePositiveInt(req.user?.employee_id);
  const requestedEmployeeId = parsePositiveInt(employee_id);
  const isAdmin = req.user?.is_admin === true;
  const employeeId = isAdmin ? (requestedEmployeeId || authEmployeeId) : authEmployeeId;
  const allowedStatus = ["confirmed", "pending", "cancelled"];

  if (!authEmployeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  if (!roomId || !employeeId || !title || !start_time || !end_time) {
    return res.status(400).json({ message: "room_id, title, start_time, end_time are required." });
  }

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({ message: "end_time must be greater than start_time." });
  }

  const conflictRows = await query(
    `
      SELECT booking_id
      FROM booking
      WHERE room_id = ?
        AND status IN ('confirmed', 'pending')
        AND start_time < ?
        AND end_time > ?
      LIMIT 1
    `,
    [roomId, end_time, start_time]
  );

  if (conflictRows.length > 0) {
    return res.status(409).json({ message: "Room is already booked for the selected time." });
  }

  const insertResult = await query(
    `
      INSERT INTO booking (room_id, employee_id, title, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [roomId, employeeId, String(title).trim(), start_time, end_time, status]
  );

  res.status(201).json({
    message: "Booking created successfully.",
    booking_id: insertResult.insertId
  });
});

module.exports = {
  getUpcomingBookings,
  getBookingSummary,
  createBooking
};
