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

function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

const getRooms = asyncHandler(async (req, res) => {
  const locationId = parsePositiveInt(req.query.location_id);
  const minCapacity = parsePositiveInt(req.query.capacity);
  const limit = normalizeLimit(req.query.limit, null, 100);
  const availableOnly = toBoolean(req.query.available_only);
  const hasStart = req.query.start_time !== undefined;
  const hasEnd = req.query.end_time !== undefined;
  const startTime = hasStart ? normalizeDateTimeForMySql(req.query.start_time) : null;
  const endTime = hasEnd ? normalizeDateTimeForMySql(req.query.end_time) : null;

  if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
    return res.status(400).json({ message: "Both start_time and end_time are required together." });
  }

  if ((hasStart && !startTime) || (hasEnd && !endTime)) {
    return res.status(400).json({ message: "Invalid start_time or end_time format." });
  }

  if (startTime && endTime && endTime <= startTime) {
    return res.status(400).json({ message: "end_time must be greater than start_time." });
  }

  let sql = "";
  const params = [];

  if (startTime && endTime) {
    sql = `
      SELECT
        mr.room_id,
        mr.location_id,
        l.name AS location_name,
        l.timezone AS location_timezone,
        mr.name,
        mr.capacity,
        mr.size_sqft,
        mr.has_projector,
        mr.has_screen,
        mr.has_whiteboard,
        mr.description,
        CASE WHEN COUNT(ob.booking_id) = 0 THEN 1 ELSE 0 END AS is_available,
        MAX(ob.end_time) AS booked_until
      FROM meeting_room mr
      INNER JOIN location l ON l.location_id = mr.location_id
      LEFT JOIN booking ob
        ON ob.room_id = mr.room_id
       AND ob.status IN ('confirmed', 'pending')
       AND ob.start_time < ?
       AND ob.end_time > ?
      WHERE 1 = 1
    `;
    params.push(endTime, startTime);
  } else {
    sql = `
      SELECT
        mr.room_id,
        mr.location_id,
        l.name AS location_name,
        l.timezone AS location_timezone,
        mr.name,
        mr.capacity,
        mr.size_sqft,
        mr.has_projector,
        mr.has_screen,
        mr.has_whiteboard,
        mr.description,
        1 AS is_available,
        NULL AS booked_until
      FROM meeting_room mr
      INNER JOIN location l ON l.location_id = mr.location_id
      WHERE 1 = 1
    `;
  }

  if (locationId) {
    sql += " AND mr.location_id = ?";
    params.push(locationId);
  }

  if (minCapacity) {
    sql += " AND mr.capacity >= ?";
    params.push(minCapacity);
  }

  if (startTime && endTime) {
    sql += `
      GROUP BY
        mr.room_id,
        mr.location_id,
        l.name,
        l.timezone,
        mr.name,
        mr.capacity,
        mr.size_sqft,
        mr.has_projector,
        mr.has_screen,
        mr.has_whiteboard,
        mr.description
    `;

    if (availableOnly) {
      sql += " HAVING is_available = 1";
    }
  }

  sql += " ORDER BY mr.location_id ASC, mr.capacity ASC, mr.name ASC";

  if (limit) {
    // Avoid prepared placeholder in LIMIT for MySQL variants that reject it.
    sql += ` LIMIT ${limit}`;
  }

  const rows = await query(sql, params);
  res.json(rows);
});

const getRoomById = asyncHandler(async (req, res) => {
  const roomId = parsePositiveInt(req.params.roomId);
  if (!roomId) {
    return res.status(400).json({ message: "Invalid room id." });
  }

  const rows = await query(
    `
      SELECT
        mr.room_id,
        mr.location_id,
        l.name AS location_name,
        l.timezone AS location_timezone,
        mr.name,
        mr.capacity,
        mr.size_sqft,
        mr.has_projector,
        mr.has_screen,
        mr.has_whiteboard,
        mr.description
      FROM meeting_room mr
      INNER JOIN location l ON l.location_id = mr.location_id
      WHERE mr.room_id = ?
      LIMIT 1
    `,
    [roomId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Room not found." });
  }

  res.json(rows[0]);
});

module.exports = { getRooms, getRoomById };
