-- Full standalone database script for the current backend schema.
-- Import with:
--   mysql -u root -p < database/meeting_room_booking_full_standalone.sql
--
-- Notes:
-- - This file is built from the current backend query expectations plus the
--   repository's base seed data and safe backfills.
-- - Seed employee passwords are pre-hashed for the default password
--   `Password@12`.
-- - The repository contains some later room-specific update statements for
--   room IDs that are not present in the current seed dump. This standalone
--   file includes the room rows that are actually defined in the repo today.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

CREATE DATABASE IF NOT EXISTS meeting_room_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE meeting_room_booking;

DROP TABLE IF EXISTS booking_audit;
DROP TABLE IF EXISTS booking_participants;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS meeting_room;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS location;

CREATE TABLE location (
  location_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  PRIMARY KEY (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO location (location_id, name, address, timezone) VALUES
  (1, 'South Africa (Head Office)', 'Unit N101B, Ground Floor\nNorth Block, Bradenham Hall\n7 Mellis Avenue\nRivonia, Sandton - 2128\nSouth Africa', 'Africa/Johannesburg'),
  (2, 'India Headquarters', 'Exaze Private Limited\n34 Sunder Nagar\nBhilai\nChhattisgarh - 490023\nIndia', 'Asia/Kolkata'),
  (3, 'United Kingdom (Sales Office)', 'Unit 11, Diddenham Court\nGrazeley\nReading\nBerkshire - RG7 1JQ\nEngland', 'Europe/London'),
  (4, 'Delivery Centre - Hyderabad', '5th Floor, Rajapushpa Summit\nNanakramguda Road\nFinancial District\nHyderabad, Telangana - 500008\nIndia', 'Asia/Kolkata'),
  (5, 'Delivery Centre - Pune', 'S-38 A, Second Floor,\nQue Spaces, Seasons Mall\nMagarpatta, Hadapsar\nPune, Maharashtra - 411013\nIndia', 'Asia/Kolkata'),
  (6, 'Delivery Centre - Bhopal', '92 B, Sector A\nIndustrial Area\nGovindpura\nBhopal, Madhya Pradesh - 462023\nIndia', 'Asia/Kolkata');

CREATE TABLE employee (
  employee_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  gender ENUM('male', 'female') NOT NULL DEFAULT 'male',
  is_admin TINYINT(1) DEFAULT '0',
  is_active TINYINT(1) NOT NULL DEFAULT '1',
  password VARCHAR(255) NOT NULL,
  password_reset_required TINYINT(1) NOT NULL DEFAULT '1',
  password_updated_at TIMESTAMP NULL DEFAULT NULL,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  role VARCHAR(100) DEFAULT NULL,
  project VARCHAR(200) DEFAULT NULL,
  manager_id INT DEFAULT NULL,
  work_location_id INT DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  hire_date DATE DEFAULT NULL,
  employee_type VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (employee_id),
  UNIQUE KEY uq_employee_email (email),
  KEY idx_employee_manager (manager_id),
  KEY idx_employee_location (work_location_id),
  CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES employee(employee_id) ON DELETE SET NULL,
  CONSTRAINT fk_employee_location FOREIGN KEY (work_location_id) REFERENCES location(location_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO employee (
  employee_id,
  name,
  email,
  department,
  gender,
  is_admin,
  is_active,
  password,
  password_reset_required,
  password_updated_at,
  last_login_at,
  role,
  project,
  manager_id,
  work_location_id,
  phone_number,
  hire_date,
  employee_type
) VALUES
  (1, 'Alice Johnson', 'alice.johnson@company.com', 'Engineering', 'female', 1, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Engineering', 'Vitality', NULL, NULL, NULL, NULL, 'Full-time'),
  (2, 'Bob Smith', 'bob.smith@company.com', 'Marketing', 'male', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Marketing', 'Investec', NULL, NULL, NULL, NULL, 'Full-time'),
  (3, 'Carol White', 'carol.white@company.com', 'Sales', 'female', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Sales', 'Investec', NULL, NULL, NULL, NULL, 'Full-time'),
  (4, 'David Brown', 'david.brown@company.com', 'Human Resources', 'male', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Human Resources', 'Discovery', NULL, NULL, NULL, NULL, 'Full-time'),
  (5, 'Eve Davis', 'eve.davis@company.com', 'Finance', 'female', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Finance', 'Discovery', NULL, NULL, NULL, NULL, 'Full-time'),
  (6, 'Frank Miller', 'frank.miller@company.com', 'Engineering', 'male', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Engineering', 'Vitality', NULL, NULL, NULL, NULL, 'Full-time'),
  (7, 'Grace Wilson', 'grace.wilson@company.com', 'Sales', 'female', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Sales', 'Investec', NULL, NULL, NULL, NULL, 'Full-time'),
  (8, 'Henry Taylor', 'henry.taylor@company.com', 'IT Support', 'male', 1, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'IT Support', 'Vitality', NULL, NULL, NULL, NULL, 'Full-time'),
  (9, 'Irene Moore', 'irene.moore@company.com', 'Marketing', 'female', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Marketing', 'Investec', NULL, NULL, NULL, NULL, 'Full-time'),
  (10, 'Jack Anderson', 'jack.anderson@company.com', 'Operations', 'male', 0, 1, '$2a$12$AZafYCJ2/FFEV/kf4afpYOiu2b/pEs7uLN2KQjUKHfR.YcDWbmnTy', 1, NULL, NULL, 'Operations', 'Discovery', NULL, NULL, NULL, NULL, 'Full-time');

CREATE TABLE meeting_room (
  room_id INT NOT NULL AUTO_INCREMENT,
  location_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  size_sqft DECIMAL(8,2) DEFAULT NULL,
  has_projector TINYINT(1) DEFAULT '0',
  has_screen TINYINT(1) DEFAULT '0',
  has_whiteboard TINYINT(1) DEFAULT '0',
  has_webcam TINYINT(1) NOT NULL DEFAULT '0',
  has_video_conferencing TINYINT(1) NOT NULL DEFAULT '0',
  has_tv_set TINYINT(1) NOT NULL DEFAULT '0',
  has_wifi TINYINT(1) NOT NULL DEFAULT '0',
  has_ac TINYINT(1) NOT NULL DEFAULT '0',
  has_power_backup TINYINT(1) NOT NULL DEFAULT '0',
  description TEXT,
  PRIMARY KEY (room_id),
  UNIQUE KEY unique_room_per_location (location_id, name),
  CONSTRAINT fk_meeting_room_location FOREIGN KEY (location_id) REFERENCES location(location_id) ON DELETE CASCADE,
  CONSTRAINT chk_meeting_room_capacity CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO meeting_room (
  room_id,
  location_id,
  name,
  capacity,
  size_sqft,
  has_projector,
  has_screen,
  has_whiteboard,
  description
) VALUES
  (1, 1, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (2, 1, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (3, 1, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (4, 1, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (5, 1, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (6, 1, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (7, 1, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (8, 1, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (9, 1, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (10, 1, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions'),
  (11, 2, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (12, 2, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (13, 2, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (14, 2, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (15, 2, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (16, 2, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (17, 2, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (18, 2, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (19, 2, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (20, 2, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions'),
  (21, 3, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (22, 3, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (23, 3, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (24, 3, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (25, 3, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (26, 3, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (27, 3, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (28, 3, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (29, 3, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (30, 3, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions'),
  (31, 4, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (32, 4, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (33, 4, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (34, 4, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (35, 4, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (36, 4, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (37, 4, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (38, 4, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (39, 4, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (40, 4, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions'),
  (41, 5, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (42, 5, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (43, 5, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (44, 5, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (45, 5, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (46, 5, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (47, 5, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (48, 5, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (49, 5, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (50, 5, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions'),
  (51, 6, 'Think Tank', 10, 200.00, 1, 1, 0, 'Ideal for brainstorming sessions'),
  (52, 6, 'Fusion', 12, 250.00, 1, 1, 1, 'Collaborative space with all amenities'),
  (53, 6, 'Nexus', 8, 180.00, 0, 1, 1, 'Small meeting room with whiteboard'),
  (54, 6, 'Cell Pod 1', 4, 100.00, 0, 0, 1, 'Private phone booth style'),
  (55, 6, 'Cell Pod 2', 4, 100.00, 0, 0, 1, 'Private focus pod'),
  (56, 6, 'Innovation Hub', 20, 400.00, 1, 1, 1, 'Large room for presentations'),
  (57, 6, 'Boardroom', 14, 300.00, 1, 1, 0, 'Formal board meetings'),
  (58, 6, 'Conference Room A', 16, 350.00, 1, 1, 1, 'Standard conference room'),
  (59, 6, 'Conference Room B', 16, 350.00, 1, 1, 0, 'Second conference room'),
  (60, 6, 'Training Room', 25, 500.00, 1, 1, 1, 'Equipped for training sessions');

UPDATE meeting_room
SET
  has_wifi = 1,
  has_ac = 1;

UPDATE meeting_room
SET has_power_backup = 1
WHERE name IN (
  'Think Tank',
  'Fusion',
  'Nexus',
  'Innovation Hub',
  'Boardroom',
  'Conference Room A',
  'Conference Room B',
  'Training Room',
  'Synergy',
  'Zenith',
  'Pinnacle',
  'Tranquil',
  'Table Mountain',
  'Drakensberg',
  'Cape Town',
  'Karoo',
  'Meerkat'
);

UPDATE meeting_room
SET
  has_webcam = 1,
  has_video_conferencing = 1
WHERE name IN (
  'Fusion',
  'Innovation Hub',
  'Boardroom',
  'Conference Room A',
  'Conference Room B',
  'Training Room',
  'Synergy',
  'Pinnacle',
  'Tranquil',
  'Table Mountain',
  'Drakensberg',
  'Cape Town',
  'Karoo',
  'Meerkat'
);

UPDATE meeting_room
SET has_tv_set = 1
WHERE name IN (
  'Fusion',
  'Innovation Hub',
  'Boardroom',
  'Conference Room A',
  'Conference Room B',
  'Pinnacle',
  'Tranquil',
  'Table Mountain',
  'Drakensberg',
  'Cape Town',
  'Karoo',
  'Meerkat'
);

UPDATE meeting_room SET
  size_sqft = 250,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 0,
  has_webcam = 0,
  has_video_conferencing = 0,
  has_tv_set = 0,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Brainstorming and ideation room'
WHERE room_id = 31;

UPDATE meeting_room SET
  size_sqft = 150,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 1,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 1,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Collaborative small team space'
WHERE room_id = 32;

UPDATE meeting_room SET
  size_sqft = 50,
  has_projector = 0,
  has_screen = 0,
  has_whiteboard = 1,
  has_webcam = 0,
  has_video_conferencing = 0,
  has_tv_set = 0,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 0,
  description = 'Private phone booth / focus pod'
WHERE room_id IN (34, 35);

UPDATE meeting_room SET
  size_sqft = 400,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 1,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 1,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Large room for presentations'
WHERE room_id = 36;

UPDATE meeting_room SET
  size_sqft = 350,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 0,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 1,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Executive board meetings'
WHERE room_id = 37;

UPDATE meeting_room SET
  size_sqft = 400,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 1,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 1,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Standard conference room'
WHERE room_id = 38;

UPDATE meeting_room SET
  size_sqft = 600,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 0,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 1,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Large conference room'
WHERE room_id = 39;

UPDATE meeting_room SET
  size_sqft = 500,
  has_projector = 1,
  has_screen = 1,
  has_whiteboard = 1,
  has_webcam = 1,
  has_video_conferencing = 1,
  has_tv_set = 0,
  has_wifi = 1,
  has_ac = 1,
  has_power_backup = 1,
  description = 'Training and workshop sessions'
WHERE room_id = 40;

CREATE TABLE booking (
  booking_id INT NOT NULL AUTO_INCREMENT,
  room_id INT NOT NULL,
  employee_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('confirmed', 'cancelled', 'pending', 'vacated') DEFAULT 'confirmed',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id),
  KEY idx_booking_room_time (room_id, start_time, end_time),
  KEY idx_booking_employee (employee_id),
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES meeting_room(room_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
  CONSTRAINT chk_booking_end_after_start CHECK (end_time > start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking_participants (
  booking_participant_id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  employee_id INT NOT NULL,
  added_by_employee_id INT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_participant_id),
  UNIQUE KEY uq_booking_participants_booking_employee (booking_id, employee_id),
  KEY idx_booking_participants_employee (employee_id),
  KEY idx_booking_participants_booking (booking_id),
  KEY idx_booking_participants_added_by (added_by_employee_id),
  CONSTRAINT fk_booking_participants_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_participants_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_participants_added_by FOREIGN KEY (added_by_employee_id) REFERENCES employee(employee_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE booking_audit (
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
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_booking_audit_booking (booking_id, created_at),
  KEY idx_booking_audit_actor (actor_employee_id, created_at),
  CONSTRAINT fk_booking_audit_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_audit_actor FOREIGN KEY (actor_employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
SET FOREIGN_KEY_CHECKS = 1;
