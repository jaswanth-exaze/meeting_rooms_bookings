ALTER TABLE employee
  ADD COLUMN password_reset_required TINYINT(1) NOT NULL DEFAULT 1 AFTER password,
  ADD COLUMN password_updated_at TIMESTAMP NULL DEFAULT NULL AFTER password_reset_required,
  ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL AFTER password_updated_at;

UPDATE employee
SET password_reset_required = 1
WHERE password_reset_required IS NULL;

ALTER TABLE booking
  MODIFY COLUMN status ENUM('confirmed', 'cancelled', 'pending', 'vacated') DEFAULT 'confirmed';

CREATE TABLE IF NOT EXISTS booking_audit (
  audit_id BIGINT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  action ENUM('created', 'updated', 'cancelled', 'vacated') NOT NULL,
  actor_employee_id INT NOT NULL,
  previous_status ENUM('confirmed', 'cancelled', 'pending', 'vacated') DEFAULT NULL,
  new_status ENUM('confirmed', 'cancelled', 'pending', 'vacated') DEFAULT NULL,
  previous_start_time DATETIME DEFAULT NULL,
  previous_end_time DATETIME DEFAULT NULL,
  new_start_time DATETIME DEFAULT NULL,
  new_end_time DATETIME DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_booking_audit_booking (booking_id, created_at),
  KEY idx_booking_audit_actor (actor_employee_id, created_at),
  CONSTRAINT fk_booking_audit_booking FOREIGN KEY (booking_id) REFERENCES booking (booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_audit_actor FOREIGN KEY (actor_employee_id) REFERENCES employee (employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


UPDATE employee
set password =  "$2a$12$tkkj5Ig7XqvK53a8HeNtUOEY.4c2/L3zVNa8QRAdKm5lud4MgqbCu"