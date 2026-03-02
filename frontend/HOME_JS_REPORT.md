# home.js Detailed Report

This document explains exactly how `frontend/home.js` works, how it connects to `home.html`, `login.js`, and backend APIs, and how data moves through each step.

## 1) Purpose of `home.js`

`home.js` powers the Home page features:

- Load location options into dropdowns
- Load featured meeting rooms
- Search rooms by filters (date, time, location, attendees)
- Open/close room details modal
- Create a booking for selected room using JWT auth
- Show booking/status messages in UI

File: `frontend/home.js`

## 2) External Connections

### 2.1 Backend API connection

`home.js` uses:

- Base URL: `http://localhost:4000/api` (`home.js:1`)
- Endpoints:

1. `GET /locations` (`home.js:169`)
2. `GET /rooms` (`home.js:192`, `home.js:248`)
3. `POST /bookings` (`home.js:337`)

### 2.2 Connection to `login.js`

`home.js` depends on auth data created by `login.js`:

- `localStorage["auth_token"]` (`home.js:308`)
- `localStorage["auth_employee"]` (`home.js:295`)

These keys are set in `frontend/login.js` after successful login.

### 2.3 Connection to HTML (`home.html`)

`home.js` reads these elements:

1. `#room-search-form`
2. `#booking-date`
3. `#booking-time`
4. `#booking-location`
5. `#booking-attendees`
6. `#featured-location-filter`
7. `.rooms-grid`
8. `#booking-message`
9. `#room-detail-modal`
10. `#room-detail-image`
11. `#room-detail-title`
12. `#room-detail-location`
13. `#room-detail-meta`
14. `#room-detail-description`
15. `#modal-book-btn`

If these IDs/classes change in `home.html`, related JS behavior will break.

## 3) Global Variables and State

### 3.1 Constants

- `API_BASE_URL` (`home.js:1`)
- `ROOM_IMAGES` (`home.js:3-12`) used to assign room card images by room id

### 3.2 Mutable state

- `currentRooms` (`home.js:31`): latest room list shown in grid
- `selectedRoom` (`home.js:32`): room currently open in modal / selected for booking

## 4) Function-by-Function Breakdown

### `setBookingMessage(message, type)` (`home.js:34`)

What it does:

- Updates `#booking-message` text
- Clears old classes `success` and `error`
- Adds class if `type` is `"success"` or `"error"`

Used by:

- Location load errors
- Featured/search errors
- Booking success/failure
- Validation messages

### `getRoomImage(roomId)` (`home.js:45`)

What it does:

- Converts `roomId` to number
- If invalid, returns fallback `assets/image(3).png`
- Else maps room id to `ROOM_IMAGES` using modulo

Purpose:

- Keeps card/modal visuals deterministic without image URL from backend.

### `getFeatureText(room)` (`home.js:55`)

What it does:

- Reads `room.has_projector`, `room.has_screen`, `room.has_whiteboard`
- Accepts boolean/number/string truthy forms (`true`, `1`, `"1"`)
- Returns features joined by `" | "`
- Returns `"Standard setup"` if none

### `getRoomMetaText(room)` (`home.js:77`)

What it does:

- Creates one display line:
  - location name
  - capacity
  - feature summary

Output example:

`"Hyderabad HQ | 8 Seats | Projector | Screen"`

### `renderLoadingCard(message)` (`home.js:85`)

What it does:

- Clears `.rooms-grid`
- Renders a single placeholder card with message

Used for:

- loading featured rooms
- loading search results
- error/empty states

### `renderRooms(rooms)` (`home.js:105`)

What it does:

- Normalizes input to array and stores in `currentRooms`
- Clears grid
- If empty, shows no-results card
- Creates one card per room:
  - image
  - title
  - meta
  - "View Details" button with `data-room-id`

Important connection:

- `handleRoomCardClick()` relies on `data-room-id` and `currentRooms`.

### `fillLocationOptions(selectElement, locations)` (`home.js:150`)

What it does:

- Rebuilds `<select>` options with:
  - default `"All Locations"`
  - values from backend `location_id`, `name`
- Restores previously selected value when possible

### `loadLocations()` (`home.js:168`)

Flow:

1. `GET /api/locations`
2. parse JSON
3. fill both location dropdowns:
   - search location
   - featured filter
4. on error: log + UI error message

### `loadFeaturedRooms()` (`home.js:181`)

Flow:

1. show loading card
2. build URL `GET /api/rooms?limit=9`
3. if featured location selected, append `location_id`
4. fetch + parse JSON
5. render rooms
6. on error: log + fallback message + UI error message

### `getSearchStartAndEnd()` (`home.js:204`)

What it does:

- Reads date + time inputs
- If missing/invalid: returns `null`
- Builds:
  - `start` ISO from selected date/time
  - `end` ISO = `start + 1 hour`

Returned shape:

```json
{
  "start": "2026-02-26T10:00:00.000Z",
  "end": "2026-02-26T11:00:00.000Z"
}
```

Used by:

- `searchRooms()`
- `bookRoom()`

### `searchRooms(event)` (`home.js:226`)

Flow:

1. stop form default submit
2. clear message and show "Searching rooms..."
3. build query params:
   - always `limit=12`
   - optional `location_id`
   - optional `capacity`
   - optional `start_time` and `end_time` from `getSearchStartAndEnd()`
4. `GET /api/rooms?{params}`
5. render rooms
6. on error: log + fallback message + UI error

### `openRoomModal(room)` (`home.js:260`)

What it does:

- stores `selectedRoom`
- fills modal fields from room data
- sets `roomDetailModal.hidden = false`

### `closeRoomModal()` (`home.js:273`)

What it does:

- hides modal
- clears `selectedRoom`

### `handleRoomCardClick(event)` (`home.js:279`)

Flow:

1. event delegation from `.rooms-grid`
2. checks clicked target for `button[data-room-id]`
3. reads room id from button
4. finds room in `currentRooms`
5. opens modal, or shows error if missing

### `getStoredEmployee()` (`home.js:294`)

What it does:

- reads `auth_employee` from localStorage
- parses JSON safely
- returns object or `null`

### `bookRoom()` (`home.js:305`)

Flow:

1. clear message
2. read JWT token from localStorage
3. validate token exists
4. validate `selectedRoom` exists
5. validate date/time (via `getSearchStartAndEnd()`)
6. build payload:
   - `room_id`
   - `title`
   - `start_time`
   - `end_time`
   - optional `employee_id` from `auth_employee`
7. `POST /api/bookings` with headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>`
8. parse response JSON
9. if non-OK, throw backend message
10. on success: close modal + success message
11. on failure: show error message

## 5) Event Wiring (No Init Wrapper)

The script directly binds listeners at bottom of file:

1. search form submit -> `searchRooms` (`home.js:362`)
2. featured location change -> `loadFeaturedRooms` (`home.js:366`)
3. rooms grid click -> `handleRoomCardClick` (`home.js:370`)
4. modal close clicks and `Esc` key -> `closeRoomModal` (`home.js:374`)
5. modal "Book This Room" button -> `bookRoom` (`home.js:388`)
6. initial data load:
   - `loadLocations()`
   - `loadFeaturedRooms()`
     when required elements exist (`home.js:392`)

## 6) Data Contracts with Backend

### 6.1 Location object expected by UI

Required keys used:

- `location_id`
- `name`

### 6.2 Room object expected by UI

Used keys:

- `room_id`
- `name`
- `location_name`
- `capacity`
- `has_projector`
- `has_screen`
- `has_whiteboard`
- `description`

### 6.3 Booking payload sent by UI

```json
{
  "room_id": 3,
  "title": "Meeting in Nexus",
  "start_time": "2026-02-26T10:00:00.000Z",
  "end_time": "2026-02-26T11:00:00.000Z",
  "employee_id": 12
}
```

`employee_id` is optional in frontend payload; backend JWT user is primary authority.

## 7) Full Runtime Sequence

### Page load sequence

1. Browser loads `home.html`.
2. `home.js` runs.
3. DOM references are collected.
4. Listeners are attached.
5. `loadLocations()` populates location dropdowns.
6. `loadFeaturedRooms()` fills initial room cards.

### User search sequence

1. User chooses filters and submits search form.
2. `searchRooms()` builds query string.
3. Backend returns filtered rooms.
4. `renderRooms()` updates cards and click targets.

### User booking sequence

1. User clicks room card button.
2. `openRoomModal()` displays room details.
3. User clicks "Book This Room".
4. `bookRoom()` validates token/date/time/room.
5. Sends authenticated `POST /bookings`.
6. On success, modal closes and success message shows.

## 8) Error Handling Behavior

Where errors are handled:

- location fetch fail -> `"Failed to load locations."`
- featured fetch fail -> `"Failed to load featured rooms."`
- room search fail -> `"Room search failed."`
- modal room missing -> `"Room details not found."`
- missing token -> `"Please sign in first to book a room."`
- missing selected room -> `"Select a room before booking."`
- missing date/time -> `"Choose booking date and time first."`
- booking API failure -> backend message or `"Booking failed."`

## 9) Important Notes and Limitations

1. `loadLocations`, `loadFeaturedRooms`, and `searchRooms` parse JSON without checking `response.ok`.
   - If backend returns 4xx/5xx JSON, UI may treat it as normal data.
2. Time conversion uses `toISOString()`.
   - This converts local selected time into UTC string for backend.
3. Room images are client-side mapped and not from backend records.
4. If localStorage is manually cleared, booking will fail until user logs in again.

## 10) Quick Connection Map

`home.html` -> `home.js` -> `GET /api/locations` -> fills location dropdowns

`home.html` search form -> `home.js searchRooms()` -> `GET /api/rooms` -> `renderRooms()`

`home.html` room button -> `home.js openRoomModal()` -> modal UI

`home.html` modal book button -> `home.js bookRoom()` -> `POST /api/bookings` with JWT

`login.js` -> localStorage (`auth_token`, `auth_employee`) -> `home.js bookRoom()`
