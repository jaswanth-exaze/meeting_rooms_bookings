# Refresh Model Detailed Report

## Updated
- March 18, 2026

## Purpose
This report explains how refresh and data synchronization work in the current dashboard architecture.

## Important Correction
Refresh behavior is no longer owned by `frontend/js/role-dashboard.js`.

The current refresh model is distributed across modular dashboard files.

## Current Files Involved
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/dashboard/employee/bookings/bookings-load.js`
- `frontend/js/dashboard/employee/overview/overview-load.js`
- `frontend/js/dashboard/employee/room-finder/finder-availability.js`
- `frontend/js/dashboard/admin/reports/admin-reports.js`
- `frontend/js/dashboard/admin/employees/employee-directory.js`
- `frontend/js/dashboard/admin/rooms/room-directory.js`
- `frontend/js/dashboard/employee/modals/room-booking-modal.js`
- `frontend/js/dashboard/employee/modals/booking-edit-modal.js`

## What "Refresh" Means Here
Refresh is event-driven, not timer-driven.

The app reloads data when:
- the dashboard first starts
- the user clicks an explicit refresh button
- a booking is created
- a booking is edited
- a booking is cancelled
- a booking is vacated
- admin data is explicitly reloaded
- admin create flows complete successfully

## Current Startup Refresh
`initializeDashboard()` loads the first screen through:
- `loadSummary()`
- `loadBookings()`
- `loadFinderLocations()`
- `loadOverviewAvailability()`
- `searchRooms()`

Admin users also load:
- `loadReports()`
- `loadEmployees()`
- `loadRooms()`

## Current Shared Booking Refresh Flow
The main shared refresh helper is:
- `refreshBookingViews()` in `frontend/js/dashboard/employee/bookings/bookings-load.js`

It currently reloads:
- summary
- bookings
- overview availability
- room search
- admin reports when the current role is admin

## Current Manual Refresh Buttons
- `#refreshBookingsBtn` -> `refreshBookingViews()`
- `#refreshEmployeesBtn` -> `loadEmployees()`
- `#refreshRoomsBtn` -> `loadRooms()`

These handlers are wired in:
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/dashboard/admin/employees/employee-directory.js`

## Current Mutation Flows That Trigger Refresh

### Room Booking
`frontend/js/dashboard/employee/modals/room-booking-modal.js`
- submits `POST /bookings`
- on success calls `refreshBookingViews()`

### Booking Edit
`frontend/js/dashboard/employee/modals/booking-edit-modal.js`
- submits `PATCH /bookings/:id`
- on success calls `refreshBookingViews()`

### Booking Cancel
`frontend/js/dashboard/employee/modals/booking-edit-modal.js`
- submits `PATCH /bookings/:id/cancel`
- on success calls `refreshBookingViews()`

### Booking Vacate
`frontend/js/dashboard/employee/modals/booking-edit-modal.js`
- submits `PATCH /bookings/:id/vacate`
- on success calls `refreshBookingViews()`

### Admin Employee Create
`frontend/js/dashboard/admin/employees/employee-directory.js`
- submits `POST /admin/employees`
- on success calls `loadEmployees()`

### Admin Room Create
`frontend/js/dashboard/admin/employees/employee-directory.js`
- submits `POST /admin/rooms`
- on success calls `loadRooms()`

## Current API Calls In The Refresh Model
- `GET /auth/me`
- `GET /bookings/summary`
- `GET /bookings/upcoming`
- `GET /rooms`
- `GET /locations`
- `GET /bookings/reports`
- `GET /admin/employees`
- `GET /admin/rooms`

## What The Current Model Does Not Do
- no polling loop
- no websocket push
- no background timer refresh every N seconds

This means the UI stays predictable and API traffic stays bounded, but live updates depend on user actions and page reload boundaries.

## Current Strengths
- refresh stays close to the feature that mutates data
- summary, bookings, and room availability stay coordinated
- admin datasets can be refreshed independently
- mutation success paths are easy to trace

## Current Limitation
- if another user changes data in parallel, the current user will not see that update until the next event-driven refresh or reload

## Conclusion
The current refresh model is a modular, event-driven reload strategy centered around `refreshBookingViews()` plus targeted admin reload calls, not a single dashboard controller and not a polling system.
