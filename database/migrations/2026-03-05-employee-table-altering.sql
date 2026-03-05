-- =====================================================
-- Employee Profile + Hierarchy Migration (Safe)
-- Date: 2026-03-05
-- Purpose:
--   1) Add profile and hierarchy columns to employee table
--   2) Keep existing data intact (non-destructive)
--   3) Add indexes and foreign keys only when missing
-- =====================================================

ALTER TABLE employee
  ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT NULL AFTER last_login_at,
  ADD COLUMN IF NOT EXISTS project VARCHAR(200) DEFAULT NULL AFTER role,
  ADD COLUMN IF NOT EXISTS manager_id INT DEFAULT NULL AFTER project,
  ADD COLUMN IF NOT EXISTS work_location_id INT DEFAULT NULL AFTER manager_id,
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT NULL AFTER work_location_id,
  ADD COLUMN IF NOT EXISTS hire_date DATE DEFAULT NULL AFTER phone_number,
  ADD COLUMN IF NOT EXISTS employee_type VARCHAR(50) DEFAULT NULL AFTER hire_date;

ALTER TABLE employee
  ADD INDEX IF NOT EXISTS idx_employee_manager (manager_id),
  ADD INDEX IF NOT EXISTS idx_employee_location (work_location_id);

-- Add self-reference manager foreign key only if missing.
SET @has_fk_employee_manager := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee'
    AND CONSTRAINT_NAME = 'fk_employee_manager'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_fk_employee_manager := IF(
  @has_fk_employee_manager = 0,
  'ALTER TABLE employee ADD CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES employee(employee_id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_fk_employee_manager FROM @sql_fk_employee_manager;
EXECUTE stmt_fk_employee_manager;
DEALLOCATE PREPARE stmt_fk_employee_manager;

-- Add location foreign key only if missing.
SET @has_fk_employee_location := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee'
    AND CONSTRAINT_NAME = 'fk_employee_location'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_fk_employee_location := IF(
  @has_fk_employee_location = 0,
  'ALTER TABLE employee ADD CONSTRAINT fk_employee_location FOREIGN KEY (work_location_id) REFERENCES location(location_id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt_fk_employee_location FROM @sql_fk_employee_location;
EXECUTE stmt_fk_employee_location;
DEALLOCATE PREPARE stmt_fk_employee_location;

-- Light backfill so profile section has reasonable defaults.
UPDATE employee
SET role = COALESCE(NULLIF(role, ''), NULLIF(department, ''), 'Employee')
WHERE role IS NULL OR role = '';

UPDATE employee
SET employee_type = COALESCE(NULLIF(employee_type, ''), 'Full-time')
WHERE employee_type IS NULL OR employee_type = '';

-- Optional backfill for project based on department.
UPDATE employee
SET project = CASE
  WHEN project IS NOT NULL AND project <> '' THEN project
  WHEN LOWER(COALESCE(department, '')) IN ('engineering', 'it support') THEN 'Vitality'
  WHEN LOWER(COALESCE(department, '')) IN ('marketing', 'sales') THEN 'Investec'
  WHEN LOWER(COALESCE(department, '')) IN ('finance', 'operations', 'human resources', 'hr') THEN 'Discovery'
  ELSE NULL
END
WHERE project IS NULL OR project = '';
