// Handle employee API helpers and route actions.

const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");

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

// Normalize text filter.
function normalizeTextFilter(value) {
  const normalized = String(value || "").trim();
  return normalized || "";
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

// Escape like value.
function escapeLikeValue(value) {
  return String(value || "").replace(/[\\%_]/g, match => `\\${match}`);
}

// Search employees for participant pickers and admin screens.
const searchEmployees = asyncHandler(async (req, res) => {
  const limit = normalizeLimit(req.query.limit, 20, 500);
  const searchTerm = normalizeTextFilter(req.query.q);
  const department = normalizeTextFilter(req.query.department);
  const project = normalizeTextFilter(req.query.project);
  const role = normalizeTextFilter(req.query.role);
  const workLocationId = parsePositiveInt(req.query.work_location_id);
  const excludeBookingId = parsePositiveInt(req.query.exclude_booking_id);
  const hasStart = req.query.start_time !== undefined;
  const hasEnd = req.query.end_time !== undefined;
  const startTime = hasStart ? normalizeDateTimeForMySql(req.query.start_time) : null;
  const endTime = hasEnd ? normalizeDateTimeForMySql(req.query.end_time) : null;
  const params = [];

  if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
    return res.status(400).json({ message: "Both start_time and end_time are required together." });
  }

  if ((hasStart && !startTime) || (hasEnd && !endTime)) {
    return res.status(400).json({ message: "Invalid start_time or end_time format." });
  }

  if (startTime && endTime && endTime <= startTime) {
    return res.status(400).json({ message: "end_time must be greater than start_time." });
  }

  const availabilityEnabled = Boolean(startTime && endTime);
  const excludeCondition = excludeBookingId ? " AND b.booking_id <> ?" : "";
  let sql = "";

  if (availabilityEnabled) {
    sql = `
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
        ) conflict
      )
      SELECT
        e.employee_id,
        e.name,
        e.email,
        e.department,
        e.project,
        e.role,
        e.employee_type,
        e.work_location_id,
        l.name AS work_location_name,
        CASE WHEN ec.employee_id IS NULL THEN 1 ELSE 0 END AS is_available,
        ec.booking_id AS conflicting_booking_id,
        ec.title AS conflicting_booking_title,
        ec.start_time AS conflicting_start_time,
        ec.end_time AS conflicting_end_time,
        ec.organizer_name AS conflicting_organizer_name,
        ec.involvement_role AS conflicting_involvement_role
      FROM employee e
      LEFT JOIN location l ON l.location_id = e.work_location_id
      LEFT JOIN employee_conflicts ec
        ON ec.employee_id = e.employee_id
       AND ec.conflict_rank = 1
      WHERE e.is_active = 1
    `;

    params.push(
      endTime,
      startTime,
      ...(excludeBookingId ? [excludeBookingId] : []),
      endTime,
      startTime,
      ...(excludeBookingId ? [excludeBookingId] : [])
    );
  } else {
    sql = `
      SELECT
        e.employee_id,
        e.name,
        e.email,
        e.department,
        e.project,
        e.role,
        e.employee_type,
        e.work_location_id,
        l.name AS work_location_name,
        1 AS is_available,
        NULL AS conflicting_booking_id,
        NULL AS conflicting_booking_title,
        NULL AS conflicting_start_time,
        NULL AS conflicting_end_time,
        NULL AS conflicting_organizer_name,
        NULL AS conflicting_involvement_role
      FROM employee e
      LEFT JOIN location l ON l.location_id = e.work_location_id
      WHERE e.is_active = 1
    `;
  }

  if (searchTerm) {
    const likeValue = `%${escapeLikeValue(searchTerm)}%`;
    sql += `
      AND (
        e.name LIKE ? ESCAPE '\\'
        OR e.email LIKE ? ESCAPE '\\'
        OR COALESCE(e.department, '') LIKE ? ESCAPE '\\'
        OR COALESCE(e.project, '') LIKE ? ESCAPE '\\'
        OR COALESCE(e.role, '') LIKE ? ESCAPE '\\'
        OR COALESCE(l.name, '') LIKE ? ESCAPE '\\'
      )
    `;
    params.push(likeValue, likeValue, likeValue, likeValue, likeValue, likeValue);
  }

  if (department) {
    sql += " AND e.department = ?";
    params.push(department);
  }

  if (project) {
    sql += " AND e.project = ?";
    params.push(project);
  }

  if (role) {
    sql += " AND e.role = ?";
    params.push(role);
  }

  if (workLocationId) {
    sql += " AND e.work_location_id = ?";
    params.push(workLocationId);
  }

  sql += `
    ORDER BY e.name ASC, e.email ASC
    LIMIT ${limit}
  `;

  const rows = await query(sql, params);

  res.json(
    rows.map(row => ({
      employee_id: Number(row.employee_id || 0),
      name: row.name || null,
      email: row.email || null,
      department: row.department || null,
      project: row.project || null,
      role: row.role || null,
      employee_type: row.employee_type || null,
      work_location_id: row.work_location_id ? Number(row.work_location_id) : null,
      work_location_name: row.work_location_name || null,
      is_available: row.is_available === undefined ? true : Number(row.is_available) === 1,
      conflicting_booking_id: row.conflicting_booking_id ? Number(row.conflicting_booking_id) : null,
      conflicting_booking_title: row.conflicting_booking_title || null,
      conflicting_start_time: row.conflicting_start_time || null,
      conflicting_end_time: row.conflicting_end_time || null,
      conflicting_organizer_name: row.conflicting_organizer_name || null,
      conflicting_involvement_role: row.conflicting_involvement_role || null
    }))
  );
});

module.exports = {
  searchEmployees
};
