# role-dashboard.js Report

## File
- `frontend/js/role-dashboard.js`

## Purpose
Single dashboard controller for both:
- `frontend/dashboards/employee-dashboard.html`
- `frontend/dashboards/admin-dashboard.html`

It handles overview cards, booking tables, room finder, modal booking/edit/cancel/vacate flows, admin employee management, reports, and profile data.

## API Integration
- API base URL from `window.APP_CONFIG.API_BASE_URL`.
- Central request helper: `apiFetch(path, options)`.
- Uses `credentials: "include"` for cookie-authenticated requests.

## Auth Session Flow
- Validates active session via `GET /auth/me` on dashboard init.
- Stores employee profile in localStorage (`auth_employee`) for UI rendering.
- No bearer token dependency.
- Logout calls `POST /auth/logout`, then clears local auth cache and redirects to home.

## Key Features
- Booking lifecycle:
  - create, edit, cancel, vacate
  - pagination and role-aware views
- Availability panel:
  - shows currently booked rooms with next available time labels
- Time handling:
  - supports 12h display + timezone code rendering
- Admin-only:
  - employee CRUD
  - reports by location and upcoming meetings
- Profile:
  - displays user details and avatar by gender
  - includes **Change Password** form (`/auth/change-password`)
  - supports forced password reset flow (`password_reset_required`)

## UX Hardening Updates (2026-03-04)
- Added managed modal focus behavior for both room and booking-edit dialogs:
  - focus moves into modal on open
  - tab sequence is trapped within open modal
  - focus returns to originating trigger on close
- Added live-region semantics to dynamic dashboard message areas (`change password`, `add employee`, room modal and booking edit helper messages).
- Improved mobile usability with larger interactive targets in CSS:
  - modal close button
  - pagination buttons
  - small action buttons
- Improved readability with stronger contrast values for key labels and status text.

## Status Handling
Supports booking statuses:
- `confirmed`
- `pending`
- `cancelled`
- `vacated`

Vacated bookings are locked for further edit/cancel/vacate actions.

## Dependencies
- `frontend/js/config.js` must load before `role-dashboard.js`.
- Uses DOM structure from both admin and employee dashboard HTML files.
