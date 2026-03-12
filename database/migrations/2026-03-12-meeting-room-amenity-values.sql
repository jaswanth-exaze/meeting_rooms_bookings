-- =====================================================
-- Meeting Room Amenity Values Backfill
-- Date: 2026-03-12
-- Purpose:
--   1) Set baseline values for new meeting_room amenity flags
--   2) Keep WiFi and AC enabled for all rooms
--   3) Derive hardware availability from room purpose and size
-- =====================================================

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



-- =====================================================
-- Update meeting room amenities based on capacity & type
-- =====================================================

-- Hyderabad (location_id = 4)
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
WHERE room_id = 31; -- Think Tank

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
WHERE room_id = 32; -- Fusion

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
WHERE room_id IN (34, 35); -- Cell Pod 1 & Cell Pod 2

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
WHERE room_id = 36; -- Innovation Hub

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
WHERE room_id = 37; -- Boardroom

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
WHERE room_id = 38; -- Conference Room A

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
WHERE room_id = 39; -- Conference Room B

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
WHERE room_id = 40; -- Training Room

UPDATE meeting_room SET
    size_sqft = 120,
    has_projector = 0,
    has_screen = 1,          -- was 0, now set to 1 to match Pune's Synergy
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 0,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Collaborative team space'
WHERE room_id = 63; -- Synergy (Hyderabad)

UPDATE meeting_room SET
    size_sqft = 80,
    has_projector = 0,
    has_screen = 0,
    has_whiteboard = 1,
    has_webcam = 0,
    has_video_conferencing = 0,
    has_tv_set = 0,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Small focus room'
WHERE room_id = 69; -- Zenith

UPDATE meeting_room SET
    size_sqft = 60,
    has_projector = 0,
    has_screen = 0,
    has_whiteboard = 0,
    has_webcam = 0,
    has_video_conferencing = 0,
    has_tv_set = 0,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 0,
    description = 'Private phone booth'
WHERE room_id = 75; -- Hubble

UPDATE meeting_room SET
    size_sqft = 70,
    has_projector = 0,
    has_screen = 0,
    has_whiteboard = 1,
    has_webcam = 0,
    has_video_conferencing = 0,
    has_tv_set = 0,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Quiet meeting nook'
WHERE room_id = 81; -- Nexus

UPDATE meeting_room SET
    size_sqft = 350,
    has_projector = 1,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Executive presentation room'
WHERE room_id = 87; -- Pinnacle

UPDATE meeting_room SET
    size_sqft = 120,
    has_projector = 0,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Relaxed meeting space'
WHERE room_id = 93; -- Tranquil

-- South Africa (location_id = 1)
UPDATE meeting_room SET
    size_sqft = 200,
    has_projector = 1,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Scenic boardroom with city views'
WHERE room_id = 97; -- Table Mountain

UPDATE meeting_room SET
    size_sqft = 200,
    has_projector = 1,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Mountain-inspired meeting space'
WHERE room_id = 98; -- Drakensberg

UPDATE meeting_room SET
    size_sqft = 150,
    has_projector = 1,
    has_screen = 1,
    has_whiteboard = 0,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Medium-sized meeting room'
WHERE room_id = 99; -- Cape Town

UPDATE meeting_room SET
    size_sqft = 60,
    has_projector = 0,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Quiet focus pod with monitor'
WHERE room_id = 100; -- Karoo

UPDATE meeting_room SET
    size_sqft = 60,
    has_projector = 0,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 1,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Small huddle room with monitor'
WHERE room_id = 101; -- Meerkat

-- Pune (location_id = 5)
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
    description = 'Collaborative team space'
WHERE room_id = 104; -- Fusion

UPDATE meeting_room SET
    size_sqft = 120,
    has_projector = 0,
    has_screen = 1,
    has_whiteboard = 1,
    has_webcam = 1,
    has_video_conferencing = 1,
    has_tv_set = 0,
    has_wifi = 1,
    has_ac = 1,
    has_power_backup = 1,
    description = 'Small team collaboration room'
WHERE room_id = 105; -- Synergy (Pune)

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
    description = 'Private focus pod'
WHERE room_id = 106; -- Cell Pod 1 (Pune)