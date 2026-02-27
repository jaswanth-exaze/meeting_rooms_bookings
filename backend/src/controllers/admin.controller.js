const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

const listEmployees = asyncHandler(async (_req, res) => {
  const rows = await query(
    `
      SELECT employee_id, name, email, department, is_admin
      FROM employee
      ORDER BY employee_id DESC
    `
  );

  res.json(
    rows.map(row => ({
      employee_id: row.employee_id,
      name: row.name,
      email: row.email,
      department: row.department,
      is_admin: toBoolean(row.is_admin)
    }))
  );
});

const createEmployee = asyncHandler(async (req, res) => {
  const rawName = req.body?.name;
  const rawEmail = req.body?.email;
  const rawDepartment = req.body?.department;
  const rawPassword = req.body?.password;
  const isAdmin = req.body?.is_admin === true;

  const name = String(rawName || "").trim();
  const email = String(rawEmail || "").trim().toLowerCase();
  const department = String(rawDepartment || "").trim();
  const password = String(rawPassword || "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const existing = await query(
    `
      SELECT employee_id
      FROM employee
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  if (existing.length > 0) {
    return res.status(409).json({ message: "An employee with this email already exists." });
  }

  const insertResult = await query(
    `
      INSERT INTO employee (name, email, department, is_admin, password)
      VALUES (?, ?, ?, ?, ?)
    `,
    [name, email, department || null, isAdmin ? 1 : 0, password]
  );

  res.status(201).json({
    message: "Employee added successfully.",
    employee: {
      employee_id: insertResult.insertId,
      name,
      email,
      department: department || null,
      is_admin: isAdmin
    }
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employeeId = parsePositiveInt(req.params.employeeId);
  const currentUserId = parsePositiveInt(req.user?.employee_id);

  if (!employeeId) {
    return res.status(400).json({ message: "Invalid employee id." });
  }

  if (employeeId === currentUserId) {
    return res.status(400).json({ message: "You cannot delete your own account." });
  }

  const result = await query("DELETE FROM employee WHERE employee_id = ?", [employeeId]);

  if (!result || result.affectedRows === 0) {
    return res.status(404).json({ message: "Employee not found." });
  }

  res.json({ message: "Employee deleted successfully." });
});

module.exports = {
  listEmployees,
  createEmployee,
  deleteEmployee
};
