# Frontend Micro Structure Guide

## Updated
- March 18, 2026

## Purpose
This guide documents the current feature-first frontend structure after the modal and dashboard refactor.

## Current JavaScript Structure

```text
frontend/js/
  auth/
    login.js
    pickers-init.js
  core/
    api.js
    config.js
    dom.js
    format.js
    pagination.js
    state.js
  home/
    core/
      home-constants.js
      home-dom.js
    theme/
      home-theme.js
    shared/
      home-page-behavior.js
      home-room-utils.js
    sections/
      home-hero.js
      home-rooms.js
    modals/
      home-modal-utils.js
      home-room-modal.js
      location-map-modal.js
    init/
      home-init.js
  dashboard/
    shared/
      theme/
        dashboard-theme.js
      layout/
        nav.js
        sidebar.js
      header/
        header-labels.js
        header-profile.js
      modals/
        dashboard-modal-shortcuts.js
        modal-manager.js
      participants/
        participant-picker.js
      init/
        dashboard-init.js
    employee/
      overview/
        overview-load.js
        overview-render.js
      bookings/
        bookings-actions.js
        bookings-load.js
        bookings-render.js
      room-finder/
        finder-availability.js
        finder-form.js
        finder-render.js
      interactions/
        room-details-interactions.js
      modals/
        booking-edit-modal.js
        room-booking-modal.js
        room-schedule-modal.js
    admin/
      employees/
        employee-directory.js
      rooms/
        room-directory.js
      reports/
        admin-reports.js
      modals/
        employee-admin-modal.js
        room-admin-modal.js
  entry/
    dashboard-entry.js
    home-entry.js
```

## Ownership Rules
- Home page behavior stays under `frontend/js/home/...`
- Employee dashboard behavior stays under `frontend/js/dashboard/employee/...`
- Admin-only behavior stays under `frontend/js/dashboard/admin/...`
- Reusable dashboard shell logic stays under `frontend/js/dashboard/shared/...`
- Cross-page utilities stay under `frontend/js/core/...`
- Page startup is reduced to `frontend/js/entry/...`

## Modal Ownership
- Home modals live under `frontend/js/home/modals/...`
- Employee dashboard modals live under `frontend/js/dashboard/employee/modals/...`
- Admin form modals live under `frontend/js/dashboard/admin/modals/...`
- Shared dashboard modal focus and keyboard behavior lives under `frontend/js/dashboard/shared/modals/...`

## Theme Ownership
- Home theme is owned by `frontend/js/home/theme/home-theme.js`
- Dashboard theme is owned by `frontend/js/dashboard/shared/theme/dashboard-theme.js`

## Important Removed Structure
The current frontend no longer uses:
- `frontend/js/home.js`
- `frontend/js/role-dashboard.js`
- `frontend/js/ui/theme.js`
- `frontend/js/ui/sidebar.js`
- `frontend/js/ui/nav.js`
- `frontend/js/ui/modals.js`

## Current Entry Points
- `frontend/home.html` -> `frontend/js/entry/home-entry.js`
- `frontend/dashboards/employee-dashboard.html` -> `frontend/js/entry/dashboard-entry.js`
- `frontend/dashboards/admin-dashboard.html` -> `frontend/js/entry/dashboard-entry.js`

## Companion Docs
- `FRONTEND_JS_FUNCTION_EXPLANATIONS.md`
- `features/modals/MODAL_OWNERSHIP_MAP.md`

## Conclusion
The current frontend structure is feature-owned, modal-owned, and page-owned. The old mixed controllers have been replaced with smaller folders that map directly to home, employee, admin, shared, and entry responsibilities.
