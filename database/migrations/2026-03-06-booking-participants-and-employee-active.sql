ALTER TABLE employee
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_admin;

UPDATE employee
SET is_active = 1
WHERE is_active IS NULL;

CREATE TABLE IF NOT EXISTS booking_participants (
  booking_participant_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  employee_id INT NOT NULL,
  added_by_employee_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_participant_id),
  UNIQUE KEY uq_booking_participants_booking_employee (booking_id, employee_id),
  KEY idx_booking_participants_employee (employee_id),
  KEY idx_booking_participants_booking (booking_id),
  KEY idx_booking_participants_added_by (added_by_employee_id),
  CONSTRAINT fk_booking_participants_booking
    FOREIGN KEY (booking_id) REFERENCES booking (booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_participants_employee
    FOREIGN KEY (employee_id) REFERENCES employee (employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_participants_added_by
    FOREIGN KEY (added_by_employee_id) REFERENCES employee (employee_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
