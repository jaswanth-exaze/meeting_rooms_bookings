# home.js Report

## File
- `frontend/js/home.js`

## Purpose
`home.js` powers the home page room discovery and quick booking flow:
- load locations
- load featured rooms
- search rooms by date/time/location/capacity
- open room details modal
- create booking for selected room

## API Integration
- API base URL is read from `window.APP_CONFIG.API_BASE_URL` (from `frontend/js/config.js`).
- Endpoints used:
  - `GET /locations`
  - `GET /rooms`
  - `POST /bookings`

## Authentication Model
- Booking uses **cookie-based auth** (`credentials: "include"`).
- `home.js` does not send bearer token from localStorage.
- If booking returns `401`, user sees sign-in prompt message.

## Main UI Bindings
- Search form: `#room-search-form`
- Date/time inputs: `#booking-date`, `#booking-time`
- Filters: `#booking-location`, `#booking-attendees`, `#featured-location-filter`
- Room grid: `.rooms-grid`
- Modal: `#room-detail-modal` and related modal fields/buttons

## Key Behaviors
- Prevents booking in the past (with small grace handling).
- Supports 12h/24h parsing and normalizes to API-friendly timestamps.
- Renders availability labels (`Available`, `Booked`, `Available after ...`).
- Uses safe text rendering (`textContent`) for most dynamic content.

## UX Hardening Updates (2026-03-04)
- Slideshow initialization is now guarded to prevent duplicate timers/listeners.
- Auto-play timer is properly stopped/restarted and paused when the tab is hidden.
- Added modal keyboard focus handling:
  - first focusable element is focused on open
  - `Tab`/`Shift+Tab` is trapped inside the modal
  - focus returns to the trigger element on close
- Home availability timestamps now use 12-hour format with timezone code (for example `IST`, `SAST`) instead of 24-hour-only rendering.
- Removed unused `roomDetailLocation` binding from `home.js`.

## Data Flow
1. Page loads -> fetch locations + featured rooms.
2. User searches -> fetch rooms with query params.
3. User opens room -> modal gets selected room context.
4. User books -> `POST /bookings` with meeting details and selected time window.
5. UI refreshes featured list after successful booking.
