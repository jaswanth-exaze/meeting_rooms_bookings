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

const getRooms = asyncHandler(async (req, res) => {
  const locationId = parsePositiveInt(req.query.location_id);
  const minCapacity = parsePositiveInt(req.query.capacity);
  const limit = normalizeLimit(req.query.limit, null, 100);
  const startTime = req.query.start_time ? String(req.query.start_time) : null;
  const endTime = req.query.end_time ? String(req.query.end_time) : null;

  let sql = `
    SELECT
      mr.room_id,
      mr.location_id,
      l.name AS location_name,
      mr.name,
      mr.capacity,
      mr.size_sqft,
      mr.has_projector,
      mr.has_screen,
      mr.has_whiteboard,
      mr.description
    FROM meeting_room mr
    INNER JOIN location l ON l.location_id = mr.location_id
    WHERE 1 = 1
  `;

  const params = [];

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
      AND NOT EXISTS (
        SELECT 1
        FROM booking b
        WHERE b.room_id = mr.room_id
          AND b.status IN ('confirmed', 'pending')
          AND b.start_time < ?
          AND b.end_time > ?
      )
    `;
    params.push(endTime, startTime);
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
