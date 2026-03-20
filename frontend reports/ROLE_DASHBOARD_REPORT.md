# Dashboard Bootstrap Report

## Updated
- March 18, 2026

## Important Correction
There is no longer a live `frontend/js/role-dashboard.js` file.

This report now documents the files that replaced that monolithic controller.

## Current Replacement Files
- `frontend/js/entry/dashboard-entry.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/core/state.js`
- `frontend/js/core/api.js`
- `frontend/js/core/pagination.js`
- `frontend/js/dashboard/shared/theme/dashboard-theme.js`
- `frontend/js/dashboard/shared/layout/nav.js`
- `frontend/js/dashboard/shared/layout/sidebar.js`
- `frontend/js/dashboard/shared/header/header-labels.js`
- `frontend/js/dashboard/shared/header/header-profile.js`

## Employee Feature Modules
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

## Admin Feature Modules
- `frontend/js/dashboard/admin/employees/employee-directory.js`
- `frontend/js/dashboard/admin/rooms/room-directory.js`
- `frontend/js/dashboard/admin/reports/admin-reports.js`
- `frontend/js/dashboard/admin/modals/employee-admin-modal.js`
- `frontend/js/dashboard/admin/modals/room-admin-modal.js`

## Current Boot Flow
1. `dashboard-entry.js` calls `initializeDashboard()`
2. `initializeDashboard()` validates the session through `ensureAuthenticatedSession()`
3. shared shell features are initialized:
   - theme
   - header labels
   - profile section
   - sidebar
   - nav
   - modal shortcuts
4. employee feature handlers are initialized
5. admin-only handlers are initialized when `currentRole === "admin"`
6. initial data loads begin:
   - summary
   - bookings
   - room finder locations
   - overview availability
   - room search
   - admin reports, employees, and rooms for admin users

## Current Auth Behavior
- Session check uses `/auth/me`
- `setCurrentEmployee()` refreshes the local employee cache
- `enforceRoleAccess()` prevents users from staying on the wrong dashboard
- forced password reset shows the profile section immediately

## Current Refresh Behavior
- `refreshBookingViews()` reloads dashboard summary, bookings, availability, room search, and admin reports where relevant
- booking create, edit, cancel, and vacate flows all use this refresh model

## Why The Old File Was Split
- the old dashboard controller carried too many unrelated responsibilities
- modal code needed feature ownership
- admin-only logic needed isolation from employee-only logic
- shared shell behavior needed its own reusable layer

## Conclusion
The dashboard is now bootstrapped by a small entry file plus `dashboard-init.js`, with the actual behavior distributed across shared, employee, and admin feature files. The old `role-dashboard.js` description is obsolete.
