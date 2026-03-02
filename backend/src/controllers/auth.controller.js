const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const providedPassword = String(password);

  const rows = await query(
    `
      SELECT employee_id, name, email, department, gender, is_admin, password
      FROM employee
      WHERE email = ?
      LIMIT 1
    `,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const employeeRow = rows[0];
  const storedPassword = String(employeeRow.password ?? "");

  if (storedPassword !== providedPassword) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const employee = {
    employee_id: employeeRow.employee_id,
    name: employeeRow.name,
    email: employeeRow.email,
    department: employeeRow.department,
    gender: employeeRow.gender || "male",
    is_admin: toBoolean(employeeRow.is_admin)
  };

  const token = jwt.sign(
    {
      employee_id: employee.employee_id,
      email: employee.email,
      name: employee.name,
      gender: employee.gender,
      is_admin: employee.is_admin
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  res.json({
    message: "Login successful.",
    token,
    employee
  });
});

module.exports = { login };
