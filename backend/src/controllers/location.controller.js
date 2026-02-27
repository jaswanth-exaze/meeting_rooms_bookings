const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");

const getLocations = asyncHandler(async (_req, res) => {
  const rows = await query(
    `
      SELECT location_id, name, address, timezone
      FROM location
      ORDER BY name
    `
  );

  res.json(rows);
});

module.exports = { getLocations };
