# Frontend Structure Report

## Updated
- March 18, 2026

## Purpose
This report documents the current frontend structure and load model after the move away from the old monolithic `home.js`, `role-dashboard.js`, and `ui/` folders.

## Current Frontend Surface
- HTML entry files: `3`
- CSS files: `7`
- JavaScript files under `frontend/js`: `47`

## Current HTML Entry Files
- `frontend/home.html`
- `frontend/dashboards/employee-dashboard.html`
- `frontend/dashboards/admin-dashboard.html`

## Current JavaScript Architecture

### Shared Foundations
- `frontend/js/core/config.js`
- `frontend/js/core/state.js`
- `frontend/js/core/format.js`
- `frontend/js/core/dom.js`
- `frontend/js/core/pagination.js`
- `frontend/js/core/api.js`

### Authentication Layer
- `frontend/js/auth/login.js`
- `frontend/js/auth/pickers-init.js`

### Home Layer
- `frontend/js/home/core/home-constants.js`
- `frontend/js/home/core/home-dom.js`
- `frontend/js/home/theme/home-theme.js`
- `frontend/js/home/shared/home-page-behavior.js`
- `frontend/js/home/shared/home-room-utils.js`
- `frontend/js/home/sections/home-hero.js`
- `frontend/js/home/sections/home-rooms.js`
- `frontend/js/home/modals/home-modal-utils.js`
- `frontend/js/home/modals/home-room-modal.js`
- `frontend/js/home/modals/location-map-modal.js`
- `frontend/js/home/init/home-init.js`

### Dashboard Shared Layer
- `frontend/js/dashboard/shared/theme/dashboard-theme.js`
- `frontend/js/dashboard/shared/layout/nav.js`
- `frontend/js/dashboard/shared/layout/sidebar.js`
- `frontend/js/dashboard/shared/header/header-labels.js`
- `frontend/js/dashboard/shared/header/header-profile.js`
- `frontend/js/dashboard/shared/modals/modal-manager.js`
- `frontend/js/dashboard/shared/modals/dashboard-modal-shortcuts.js`
- `frontend/js/dashboard/shared/participants/participant-picker.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`

### Dashboard Employee Layer
- `frontend/js/dashboard/employee/overview/overview-load.js`
- `frontend/js/dashboard/employee/overview/overview-render.js`
- `frontend/js/dashboard/employee/bookings/bookings-actions.js`
- `frontend/js/dashboard/employee/bookings/bookings-load.js`
- `frontend/js/dashboard/employee/bookings/bookings-render.js`
- `frontend/js/dashboard/employee/room-finder/finder-form.js`
- `frontend/js/dashboard/employee/room-finder/finder-render.js`
- `frontend/js/dashboard/employee/room-finder/finder-availability.js`
- `frontend/js/dashboard/employee/interactions/room-details-interactions.js`
- `frontend/js/dashboard/employee/modals/booking-edit-modal.js`
- `frontend/js/dashboard/employee/modals/room-booking-modal.js`
- `frontend/js/dashboard/employee/modals/room-schedule-modal.js`

### Dashboard Admin Layer
- `frontend/js/dashboard/admin/employees/employee-directory.js`
- `frontend/js/dashboard/admin/rooms/room-directory.js`
- `frontend/js/dashboard/admin/reports/admin-reports.js`
- `frontend/js/dashboard/admin/modals/employee-admin-modal.js`
- `frontend/js/dashboard/admin/modals/room-admin-modal.js`

### Entry Layer
- `frontend/js/entry/home-entry.js`
- `frontend/js/entry/dashboard-entry.js`

## Current Load Order

### Home Page
1. `frontend/js/core/config.js`
2. Flatpickr CDN
3. `frontend/js/auth/login.js`
4. `frontend/js/auth/pickers-init.js`
5. home feature files
6. `frontend/js/entry/home-entry.js`

### Employee Dashboard
1. Flatpickr CDN
2. `frontend/js/auth/pickers-init.js`
3. `frontend/js/core/*`
4. `frontend/js/dashboard/shared/*`
5. `frontend/js/dashboard/employee/*`
6. `frontend/js/entry/dashboard-entry.js`

### Admin Dashboard
1. Flatpickr CDN
2. `frontend/js/auth/pickers-init.js`
3. `frontend/js/core/*`
4. `frontend/js/dashboard/shared/*`
5. employee dashboard shared features needed by admin
6. admin-only files
7. `frontend/js/entry/dashboard-entry.js`

## Why The Current Structure Is Better
- feature ownership is explicit
- home and dashboard no longer share a mixed controller file
- modal code stays near the feature that owns the modal
- admin-only logic no longer leaks into employee folders
- entry scripts stay tiny and predictable
- shared dashboard infrastructure is separated from business features

## Important Removed Structure
This report replaces the older structure description that referenced:
- `frontend/js/ui/theme.js`
- `frontend/js/ui/sidebar.js`
- `frontend/js/ui/nav.js`
- `frontend/js/ui/modals.js`
- `frontend/js/dashboard/header/...`
- `frontend/js/dashboard/overview/...`
- `frontend/js/dashboard/bookings/...`
- `frontend/js/dashboard/room-finder/...`
- `frontend/js/dashboard/init/dashboard-init.js`
- `frontend/js/home.js`
- `frontend/js/role-dashboard.js`

## Current CSS Notes
- `frontend/css/common.css` remains the broad shared style layer
- `frontend/css/picker.css`, `picker-date.css`, and `picker-time.css` support the shared picker system
- `frontend/css/admin.css` and `employee.css` still exist as page-level CSS entry layers

## Current Entry Philosophy
- `home-entry.js` only starts `initializeHome()`
- `dashboard-entry.js` only starts `initializeDashboard()`
- all substantial behavior lives below those entry files

## Conclusion
The current frontend is a modular, feature-first structure with explicit page entry points, shared core utilities, feature-owned modal files, and separate employee/admin behavior.
