const jwt = require("jsonwebtoken");
const { authCookieName, jwtSecret } = require("../config/env");

function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function parseCookies(rawCookieHeader) {
  const output = {};
  const cookieHeader = String(rawCookieHeader || "").trim();
  if (!cookieHeader) return output;

  const segments = cookieHeader.split(";");
  for (const segment of segments) {
    const [name, ...valueParts] = segment.split("=");
    const key = String(name || "").trim();
    if (!key) continue;
    const value = valueParts.join("=");
    try {
      output[key] = decodeURIComponent(String(value || "").trim());
    } catch (_error) {
      output[key] = String(value || "").trim();
    }
  }
  return output;
}

function getBearerToken(authHeaderRaw) {
  const authHeader = String(authHeaderRaw || "");
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function requireAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = String(cookies[authCookieName] || "").trim();
  const bearerToken = getBearerToken(req.headers.authorization);
  const token = cookieToken || bearerToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      employee_id: Number(payload.employee_id),
      email: payload.email,
      name: payload.name,
      department: payload.department,
      gender: payload.gender,
      is_admin: toBoolean(payload.is_admin),
      password_reset_required: toBoolean(payload.password_reset_required)
    };
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
