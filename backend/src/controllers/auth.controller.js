const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");
const jwt = require("jsonwebtoken");
const {
  authCookieMaxAgeMs,
  authCookieName,
  authCookieSameSite,
  authCookieSecure,
  jwtExpiresIn,
  jwtSecret
} = require("../config/env");
const { getPasswordValidationError, hashPassword, verifyPassword } = require("../utils/password");

function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function buildEmployeePayload(employeeRow) {
  return {
    employee_id: employeeRow.employee_id,
    name: employeeRow.name,
    email: employeeRow.email,
    department: employeeRow.department,
    gender: employeeRow.gender || "male",
    is_admin: toBoolean(employeeRow.is_admin),
    password_reset_required: toBoolean(employeeRow.password_reset_required)
  };
}

function signAuthToken(employee) {
  return jwt.sign(
    {
      employee_id: employee.employee_id,
      email: employee.email,
      name: employee.name,
      department: employee.department || null,
      gender: employee.gender,
      is_admin: employee.is_admin,
      password_reset_required: employee.password_reset_required
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: authCookieSameSite,
    secure: authCookieSecure,
    maxAge: authCookieMaxAgeMs,
    path: "/"
  };
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, buildCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: authCookieSameSite,
    secure: authCookieSecure,
    path: "/"
  });
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const providedPassword = String(password);

  let rows;
  try {
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin, password, password_reset_required
        FROM employee
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin, password
        FROM employee
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );
    rows = rows.map(row => ({ ...row, password_reset_required: 0 }));
  }

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const employeeRow = rows[0];
  const passwordCheck = await verifyPassword(employeeRow.password, providedPassword);
  if (!passwordCheck.matched) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  if (passwordCheck.legacy) {
    const hashedPassword = await hashPassword(providedPassword);
    try {
      await query(
        `
          UPDATE employee
          SET password = ?, password_reset_required = 1, password_updated_at = UTC_TIMESTAMP(), last_login_at = UTC_TIMESTAMP()
          WHERE employee_id = ?
        `,
        [hashedPassword, employeeRow.employee_id]
      );
    } catch (error) {
      if (error?.code !== "ER_BAD_FIELD_ERROR") {
        throw error;
      }
      await query("UPDATE employee SET password = ? WHERE employee_id = ?", [hashedPassword, employeeRow.employee_id]);
    }
    employeeRow.password_reset_required = 1;
  } else {
    try {
      await query("UPDATE employee SET last_login_at = UTC_TIMESTAMP() WHERE employee_id = ?", [employeeRow.employee_id]);
    } catch (error) {
      if (error?.code !== "ER_BAD_FIELD_ERROR") {
        throw error;
      }
    }
  }

  const employee = buildEmployeePayload(employeeRow);
  const token = signAuthToken(employee);
  setAuthCookie(res, token);

  return res.json({
    message: "Login successful.",
    employee
  });
});

const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully." });
});

const me = asyncHandler(async (req, res) => {
  const employeeId = parsePositiveInt(req.user?.employee_id);
  if (!employeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  let rows;
  try {
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin, password_reset_required
        FROM employee
        WHERE employee_id = ?
        LIMIT 1
      `,
      [employeeId]
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin
        FROM employee
        WHERE employee_id = ?
        LIMIT 1
      `,
      [employeeId]
    );
    rows = rows.map(row => ({ ...row, password_reset_required: 0 }));
  }

  if (rows.length === 0) {
    clearAuthCookie(res);
    return res.status(401).json({ message: "Authenticated user was not found." });
  }

  return res.json({ employee: buildEmployeePayload(rows[0]) });
});

const changePassword = asyncHandler(async (req, res) => {
  const employeeId = parsePositiveInt(req.user?.employee_id);
  if (!employeeId) {
    return res.status(401).json({ message: "Invalid authenticated user." });
  }

  const currentPassword = String(req.body?.current_password || "");
  const newPassword = String(req.body?.new_password || "");

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "current_password and new_password are required." });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: "New password must be different from current password." });
  }

  const passwordValidationError = getPasswordValidationError(newPassword);
  if (passwordValidationError) {
    return res.status(400).json({ message: passwordValidationError });
  }

  let rows;
  try {
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin, password, password_reset_required
        FROM employee
        WHERE employee_id = ?
        LIMIT 1
      `,
      [employeeId]
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }
    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin, password
        FROM employee
        WHERE employee_id = ?
        LIMIT 1
      `,
      [employeeId]
    );
    rows = rows.map(row => ({ ...row, password_reset_required: 0 }));
  }

  if (rows.length === 0) {
    clearAuthCookie(res);
    return res.status(401).json({ message: "Authenticated user was not found." });
  }

  const employeeRow = rows[0];
  const passwordCheck = await verifyPassword(employeeRow.password, currentPassword);
  if (!passwordCheck.matched) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  const newPasswordHash = await hashPassword(newPassword);
  try {
    await query(
      `
        UPDATE employee
        SET password = ?, password_reset_required = 0, password_updated_at = UTC_TIMESTAMP()
        WHERE employee_id = ?
      `,
      [newPasswordHash, employeeId]
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }
    await query("UPDATE employee SET password = ? WHERE employee_id = ?", [newPasswordHash, employeeId]);
  }

  const updatedEmployee = buildEmployeePayload({
    ...employeeRow,
    password_reset_required: 0
  });
  const token = signAuthToken(updatedEmployee);
  setAuthCookie(res, token);

  return res.json({
    message: "Password changed successfully.",
    employee: updatedEmployee
  });
});

module.exports = {
  changePassword,
  login,
  logout,
  me
};
