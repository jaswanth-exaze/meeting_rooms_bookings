ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER title;

ALTER TABLE employee
  ADD COLUMN IF NOT EXISTS gender ENUM('male','female') NOT NULL DEFAULT 'male' AFTER department;

UPDATE employee
SET gender = CASE
  WHEN LOWER(name) IN ('alice johnson', 'carol white', 'eve davis', 'grace wilson', 'irene moore') THEN 'female'
  ELSE 'male'
END
WHERE gender IS NULL OR gender = '';
