// Handle admin API helpers and route actions.

const asyncHandler = require("../middleware/asyncHandler");
const { query } = require("../config/db");
const { getPasswordValidationError, hashPassword } = require("../utils/password");

// Parse a positive integer from the provided value.
function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

// Normalize loosely typed truthy values into a boolean.
function toBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

// Normalize gender.
function normalizeGender(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "female") return "female";
  if (normalized === "male") return "male";
  return null;
}

// Normalize optional text.
function normalizeOptionalText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

// Normalize optional number.
function normalizeOptionalNumber(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

// Normalize date.
function normalizeDate(value) {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return null;

  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== raw) return null;

  return raw;
}

// Shape an employee row into the API payload returned to clients.
function buildEmployeePayload(row) {
  return {
    employee_id: Number(row.employee_id || 0),
    name: row.name || null,
    email: row.email || null,
    department: row.department || null,
    gender: row.gender || "male",
    role: row.role || null,
    project: row.project || null,
    manager_id: parsePositiveInt(row.manager_id),
    manager_name: row.manager_name || null,
    work_location_id: parsePositiveInt(row.work_location_id),
    work_location_name: row.work_location_name || null,
    phone_number: row.phone_number || null,
    hire_date: row.hire_date || null,
    employee_type: row.employee_type || null,
    is_admin: toBoolean(row.is_admin),
    is_active: row.is_active === undefined ? true : toBoolean(row.is_active),
    password_reset_required: row.password_reset_required === undefined ? true : toBoolean(row.password_reset_required)
  };
}

// Shape a room row into the API payload returned to clients.
function buildRoomPayload(row) {
  return {
    room_id: Number(row.room_id || 0),
    location_id: Number(row.location_id || 0),
    location_name: row.location_name || null,
    location_timezone: row.location_timezone || null,
    name: row.name || null,
    capacity: Number(row.capacity || 0),
    size_sqft: row.size_sqft === null || row.size_sqft === undefined ? null : Number(row.size_sqft),
    has_projector: toBoolean(row.has_projector),
    has_screen: toBoolean(row.has_screen),
    has_whiteboard: toBoolean(row.has_whiteboard),
    has_webcam: toBoolean(row.has_webcam),
    has_video_conferencing: toBoolean(row.has_video_conferencing),
    has_tv_set: toBoolean(row.has_tv_set),
    has_wifi: toBoolean(row.has_wifi),
    has_ac: toBoolean(row.has_ac),
    has_power_backup: toBoolean(row.has_power_backup),
    description: row.description || null
  };
}

// Return the employee list for the admin screen.
const listEmployees = asyncHandler(async (_req, res) => {
  let rows;

  try {
    rows = await query(
      `
        SELECT
          e.employee_id,
          e.name,
          e.email,
          e.department,
          e.gender,
          e.role,
          e.project,
          e.manager_id,
          manager.name AS manager_name,
          e.work_location_id,
          location.name AS work_location_name,
          e.phone_number,
          e.hire_date,
          e.employee_type,
          e.is_admin,
          e.is_active,
          e.password_reset_required
        FROM employee e
        LEFT JOIN employee manager ON manager.employee_id = e.manager_id
        LEFT JOIN location ON location.location_id = e.work_location_id
        ORDER BY e.employee_id DESC
      `
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }

    rows = await query(
      `
        SELECT employee_id, name, email, department, gender, is_admin
        FROM employee
        ORDER BY employee_id DESC
      `
    );
  }

  res.json(rows.map(buildEmployeePayload));
});

// Create a new employee record with validation and defaults.
const createEmployee = asyncHandler(async (req, res) => {
  const rawName = req.body?.name;
  const rawEmail = req.body?.email;
  const rawDepartment = req.body?.department;
  const rawGender = req.body?.gender;
  const rawRole = req.body?.role;
  const rawProject = req.body?.project;
  const rawManagerId = req.body?.manager_id;
  const rawWorkLocationId = req.body?.work_location_id;
  const rawPhoneNumber = req.body?.phone_number;
  const rawHireDate = req.body?.hire_date;
  const rawEmployeeType = req.body?.employee_type;
  const rawPassword = req.body?.password;
  const isAdmin = toBoolean(req.body?.is_admin);
  const isActive = req.body?.is_active === undefined ? true : toBoolean(req.body?.is_active);

  const name = String(rawName || "").trim();
  const email = String(rawEmail || "").trim().toLowerCase();
  const department = normalizeOptionalText(rawDepartment);
  const gender = normalizeGender(rawGender);
  const role = normalizeOptionalText(rawRole);
  const project = normalizeOptionalText(rawProject);
  const managerId = parsePositiveInt(rawManagerId);
  const workLocationId = parsePositiveInt(rawWorkLocationId);
  const phoneNumber = normalizeOptionalText(rawPhoneNumber);
  const hireDate = normalizeDate(rawHireDate);
  const employeeType = normalizeOptionalText(rawEmployeeType);
  const password = String(rawPassword || "");

  if (!name || !email || !password || !gender) {
    return res.status(400).json({ message: "name, email, gender, and password are required." });
  }

  if (rawHireDate !== undefined && rawHireDate !== null && String(rawHireDate).trim() && !hireDate) {
    return res.status(400).json({ message: "hire_date must be a valid date in YYYY-MM-DD format." });
  }

  const passwordValidationError = getPasswordValidationError(password);
  if (passwordValidationError) {
    return res.status(400).json({ message: passwordValidationError });
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

  let managerName = null;
  if (managerId) {
    const managerRows = await query(
      `
        SELECT employee_id, name
        FROM employee
        WHERE employee_id = ?
        LIMIT 1
      `,
      [managerId]
    );

    if (managerRows.length === 0) {
      return res.status(400).json({ message: "Selected manager does not exist." });
    }

    managerName = managerRows[0].name || null;
  }

  let workLocationName = null;
  if (workLocationId) {
    const locationRows = await query(
      `
        SELECT location_id, name
        FROM location
        WHERE location_id = ?
        LIMIT 1
      `,
      [workLocationId]
    );

    if (locationRows.length === 0) {
      return res.status(400).json({ message: "Selected work location does not exist." });
    }

    workLocationName = locationRows[0].name || null;
  }

  const hashedPassword = await hashPassword(password);

  let insertResult;
  try {
    insertResult = await query(
      `
        INSERT INTO employee (
          name,
          email,
          department,
          gender,
          role,
          project,
          manager_id,
          work_location_id,
          phone_number,
          hire_date,
          employee_type,
          is_admin,
          is_active,
          password,
          password_reset_required,
          password_updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, UTC_TIMESTAMP())
      `,
      [
        name,
        email,
        department,
        gender,
        role,
        project,
        managerId,
        workLocationId,
        phoneNumber,
        hireDate,
        employeeType,
        isAdmin ? 1 : 0,
        isActive ? 1 : 0,
        hashedPassword
      ]
    );
  } catch (error) {
    if (error?.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }
    insertResult = await query(
      `
        INSERT INTO employee (name, email, department, gender, is_admin, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email, department, gender, isAdmin ? 1 : 0, hashedPassword]
    );
  }

  res.status(201).json({
    message: "Employee added successfully.",
    employee: buildEmployeePayload({
      employee_id: insertResult.insertId,
      name,
      email,
      department,
      gender,
      role,
      project,
      manager_id: managerId,
      manager_name: managerName,
      work_location_id: workLocationId,
      work_location_name: workLocationName,
      phone_number: phoneNumber,
      hire_date: hireDate,
      employee_type: employeeType,
      is_admin: isAdmin,
      is_active: isActive,
      password_reset_required: true
    })
  });
});

// Return the room list for the admin screen.
const listRooms = asyncHandler(async (_req, res) => {
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
        mr.has_webcam,
        mr.has_video_conferencing,
        mr.has_tv_set,
        mr.has_wifi,
        mr.has_ac,
        mr.has_power_backup,
        mr.description
      FROM meeting_room mr
      INNER JOIN location l ON l.location_id = mr.location_id
      ORDER BY l.name ASC, mr.name ASC
    `
  );

  res.json(rows.map(buildRoomPayload));
});

// Create a new room record with validation and defaults.
const createRoom = asyncHandler(async (req, res) => {
  const rawName = req.body?.name;
  const rawLocationId = req.body?.location_id;
  const rawCapacity = req.body?.capacity;
  const rawSizeSqft = req.body?.size_sqft;
  const rawDescription = req.body?.description;

  const name = String(rawName || "").trim();
  const locationId = parsePositiveInt(rawLocationId);
  const capacity = parsePositiveInt(rawCapacity);
  const sizeSqft = normalizeOptionalNumber(rawSizeSqft);
  const description = normalizeOptionalText(rawDescription);

  const hasProjector = toBoolean(req.body?.has_projector);
  const hasScreen = toBoolean(req.body?.has_screen);
  const hasWhiteboard = toBoolean(req.body?.has_whiteboard);
  const hasWebcam = toBoolean(req.body?.has_webcam);
  const hasVideoConferencing = toBoolean(req.body?.has_video_conferencing);
  const hasTvSet = toBoolean(req.body?.has_tv_set);
  const hasWifi = toBoolean(req.body?.has_wifi);
  const hasAc = toBoolean(req.body?.has_ac);
  const hasPowerBackup = toBoolean(req.body?.has_power_backup);

  if (!name || !locationId || !capacity) {
    return res.status(400).json({ message: "name, location_id, and capacity are required." });
  }

  if (rawSizeSqft !== undefined && rawSizeSqft !== null && String(rawSizeSqft).trim() && !sizeSqft) {
    return res.status(400).json({ message: "size_sqft must be a positive number." });
  }

  const locationRows = await query(
    `
      SELECT location_id, name, timezone
      FROM location
      WHERE location_id = ?
      LIMIT 1
    `,
    [locationId]
  );

  if (locationRows.length === 0) {
    return res.status(400).json({ message: "Selected location does not exist." });
  }

  let insertResult;
  try {
    insertResult = await query(
      `
        INSERT INTO meeting_room (
          location_id,
          name,
          capacity,
          size_sqft,
          has_projector,
          has_screen,
          has_whiteboard,
          has_webcam,
          has_video_conferencing,
          has_tv_set,
          has_wifi,
          has_ac,
          has_power_backup,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        locationId,
        name,
        capacity,
        sizeSqft,
        hasProjector ? 1 : 0,
        hasScreen ? 1 : 0,
        hasWhiteboard ? 1 : 0,
        hasWebcam ? 1 : 0,
        hasVideoConferencing ? 1 : 0,
        hasTvSet ? 1 : 0,
        hasWifi ? 1 : 0,
        hasAc ? 1 : 0,
        hasPowerBackup ? 1 : 0,
        description
      ]
    );
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A room with this name already exists at the selected location." });
    }
    throw error;
  }

  res.status(201).json({
    message: "Meeting room added successfully.",
    room: buildRoomPayload({
      room_id: insertResult.insertId,
      location_id: locationId,
      location_name: locationRows[0].name || null,
      location_timezone: locationRows[0].timezone || null,
      name,
      capacity,
      size_sqft: sizeSqft,
      has_projector: hasProjector,
      has_screen: hasScreen,
      has_whiteboard: hasWhiteboard,
      has_webcam: hasWebcam,
      has_video_conferencing: hasVideoConferencing,
      has_tv_set: hasTvSet,
      has_wifi: hasWifi,
      has_ac: hasAc,
      has_power_backup: hasPowerBackup,
      description
    })
  });
});

// Delete an employee record after safety checks.
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
  deleteEmployee,
  listRooms,
  createRoom
};
