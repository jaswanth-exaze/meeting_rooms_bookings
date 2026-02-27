const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      employee_id: Number(payload.employee_id),
      email: payload.email,
      name: payload.name,
      is_admin: toBoolean(payload.is_admin)
    };
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = requireAuth;
