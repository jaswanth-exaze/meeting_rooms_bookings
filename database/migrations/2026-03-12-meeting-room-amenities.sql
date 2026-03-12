-- =====================================================
-- Meeting Room Amenities Migration
-- Date: 2026-03-12
-- Purpose:
--   1) Add new amenity flags to meeting_room when missing
--   2) Keep existing room data intact
-- =====================================================

SET @has_meeting_room_has_webcam := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_webcam'
);
SET @sql_meeting_room_has_webcam := IF(
  @has_meeting_room_has_webcam = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_webcam TINYINT(1) NOT NULL DEFAULT 0 AFTER has_whiteboard',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_webcam FROM @sql_meeting_room_has_webcam;
EXECUTE stmt_meeting_room_has_webcam;
DEALLOCATE PREPARE stmt_meeting_room_has_webcam;

SET @has_meeting_room_has_video_conferencing := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_video_conferencing'
);
SET @sql_meeting_room_has_video_conferencing := IF(
  @has_meeting_room_has_video_conferencing = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_video_conferencing TINYINT(1) NOT NULL DEFAULT 0 AFTER has_webcam',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_video_conferencing FROM @sql_meeting_room_has_video_conferencing;
EXECUTE stmt_meeting_room_has_video_conferencing;
DEALLOCATE PREPARE stmt_meeting_room_has_video_conferencing;

SET @has_meeting_room_has_tv_set := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_tv_set'
);
SET @sql_meeting_room_has_tv_set := IF(
  @has_meeting_room_has_tv_set = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_tv_set TINYINT(1) NOT NULL DEFAULT 0 AFTER has_video_conferencing',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_tv_set FROM @sql_meeting_room_has_tv_set;
EXECUTE stmt_meeting_room_has_tv_set;
DEALLOCATE PREPARE stmt_meeting_room_has_tv_set;

SET @has_meeting_room_has_wifi := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_wifi'
);
SET @sql_meeting_room_has_wifi := IF(
  @has_meeting_room_has_wifi = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_wifi TINYINT(1) NOT NULL DEFAULT 0 AFTER has_tv_set',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_wifi FROM @sql_meeting_room_has_wifi;
EXECUTE stmt_meeting_room_has_wifi;
DEALLOCATE PREPARE stmt_meeting_room_has_wifi;

SET @has_meeting_room_has_ac := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_ac'
);
SET @sql_meeting_room_has_ac := IF(
  @has_meeting_room_has_ac = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_ac TINYINT(1) NOT NULL DEFAULT 0 AFTER has_wifi',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_ac FROM @sql_meeting_room_has_ac;
EXECUTE stmt_meeting_room_has_ac;
DEALLOCATE PREPARE stmt_meeting_room_has_ac;

SET @has_meeting_room_has_power_backup := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meeting_room'
    AND COLUMN_NAME = 'has_power_backup'
);
SET @sql_meeting_room_has_power_backup := IF(
  @has_meeting_room_has_power_backup = 0,
  'ALTER TABLE meeting_room ADD COLUMN has_power_backup TINYINT(1) NOT NULL DEFAULT 0 AFTER has_ac',
  'SELECT 1'
);
PREPARE stmt_meeting_room_has_power_backup FROM @sql_meeting_room_has_power_backup;
EXECUTE stmt_meeting_room_has_power_backup;
DEALLOCATE PREPARE stmt_meeting_room_has_power_backup;
