const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "meeting_room_booking"
  }
};
