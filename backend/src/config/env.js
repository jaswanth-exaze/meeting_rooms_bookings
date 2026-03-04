const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function parseDurationMs(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  if (/^\d+$/.test(raw)) {
    return Number.parseInt(raw, 10);
  }

  const match = raw.match(/^(\d+)\s*([smhd])$/i);
  if (!match) return fallback;

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) return fallback;

  if (unit === "s") return amount * 1000;
  if (unit === "m") return amount * 60 * 1000;
  if (unit === "h") return amount * 60 * 60 * 1000;
  if (unit === "d") return amount * 24 * 60 * 60 * 1000;
  return fallback;
}

const nodeEnv = String(process.env.NODE_ENV || "development").trim().toLowerCase();
const isProduction = nodeEnv === "production";

const defaultCorsOrigins = [
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000"
];
const corsOrigins = parseCsv(process.env.CORS_ORIGIN || defaultCorsOrigins.join(","));
if (corsOrigins.length === 0) {
  throw new Error("CORS_ORIGIN must contain at least one allowed origin.");
}
if (corsOrigins.includes("*")) {
  throw new Error("CORS_ORIGIN wildcard '*' is not allowed. Provide explicit frontend origins.");
}

const jwtSecret = String(process.env.JWT_SECRET || "").trim();
const disallowedJwtSecrets = new Set([
  "dev_jwt_secret_change_me",
  "change_me_to_a_long_random_secret",
  "replace_with_minimum_32_characters_random_value"
]);
if (!jwtSecret || jwtSecret.length < 32 || disallowedJwtSecrets.has(jwtSecret)) {
  throw new Error("JWT_SECRET must be a strong secret with at least 32 characters and not a default placeholder.");
}

const jwtExpiresIn = String(process.env.JWT_EXPIRES_IN || "2h").trim();
const authCookieName = String(process.env.AUTH_COOKIE_NAME || "mrb_auth").trim() || "mrb_auth";
const authCookieSecure = toBoolean(process.env.AUTH_COOKIE_SECURE, isProduction);
const authCookieSameSiteRaw = String(process.env.AUTH_COOKIE_SAME_SITE || "lax").trim().toLowerCase();
const authCookieSameSite = ["lax", "strict", "none"].includes(authCookieSameSiteRaw)
  ? authCookieSameSiteRaw
  : "lax";
const authCookieMaxAgeMs = parseDurationMs(process.env.AUTH_COOKIE_MAX_AGE || jwtExpiresIn, 2 * 60 * 60 * 1000);
if (authCookieSameSite === "none" && !authCookieSecure) {
  throw new Error("AUTH_COOKIE_SAME_SITE=none requires AUTH_COOKIE_SECURE=true.");
}

module.exports = {
  nodeEnv,
  isProduction,
  port: toNumber(process.env.PORT, 4000),
  corsOrigins,
  jwtSecret,
  jwtExpiresIn,
  authCookieName,
  authCookieSecure,
  authCookieSameSite,
  authCookieMaxAgeMs,
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "meeting_room_booking"
  }
};
