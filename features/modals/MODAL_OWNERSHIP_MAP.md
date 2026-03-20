# Modal Ownership Map

## Updated
- March 18, 2026

This file maps each modal to the JavaScript file that currently owns its open, close, content, and interaction behavior.

## Home Modals
- `Room Detail Modal` -> [home-room-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/home/modals/home-room-modal.js)
- `Location Map Modal` -> [location-map-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/home/modals/location-map-modal.js)
- `Home modal focus helpers` -> [home-modal-utils.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/home/modals/home-modal-utils.js)

## Dashboard Shared Modal Infrastructure
- `Shared dashboard open/close and focus management` -> [modal-manager.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/modals/modal-manager.js)
- `Shared Escape and keyboard modal shortcuts` -> [dashboard-modal-shortcuts.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/modals/dashboard-modal-shortcuts.js)
- `Shared participant picker used inside booking modals` -> [participant-picker.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/participants/participant-picker.js)

## Employee Dashboard Modals
- `Booking Edit Modal` -> [booking-edit-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/employee/modals/booking-edit-modal.js)
- `Room Booking Modal` -> [room-booking-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/employee/modals/room-booking-modal.js)
- `Room Schedule Modal` -> [room-schedule-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/employee/modals/room-schedule-modal.js)

## Employee Dashboard Trigger Owners
- `Open room modal from finder table and availability list` -> [room-details-interactions.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/employee/interactions/room-details-interactions.js)
- `Refresh booking state after modal actions` -> [bookings-load.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/employee/bookings/bookings-load.js)
- `Route booking table button clicks into edit, view, cancel, and vacate flows` -> [dashboard-init.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/init/dashboard-init.js)

## Admin Dashboard Modals
- `Add Employee Modal` -> [employee-admin-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/admin/modals/employee-admin-modal.js)
- `Add Room Modal` -> [room-admin-modal.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/admin/modals/room-admin-modal.js)

## Admin Dashboard Trigger Owners
- `Employee modal open button, employee form submit, employee delete button` -> [employee-directory.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/admin/employees/employee-directory.js)
- `Room modal open button, room form submit, room filtering` -> [employee-directory.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/admin/employees/employee-directory.js) and [room-directory.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/admin/rooms/room-directory.js)

## Important Ownership Notes
- Modal code is no longer described as living in `frontend/js/ui/modals.js`.
- Home modal behavior is no longer mixed into a single `frontend/js/home.js`.
- Dashboard modal behavior is no longer mixed into a single `frontend/js/role-dashboard.js`.
- Modal ownership now follows the feature-first folder structure.
