# Modern Pickers Guide

## Updated
- March 18, 2026

## Overview
The current picker system is split into three parts:
- Flatpickr-enhanced date inputs
- a custom 12-hour popup time picker
- lightweight select open-state styling

The runtime entry for all three is [pickers-init.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/pickers-init.js).

## Current Source Files
- [pickers-init.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/pickers-init.js)
- [picker.css](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/css/picker.css)
- [picker-date.css](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/css/picker-date.css)
- [picker-time.css](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/css/picker-time.css)
- [home.html](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/home.html)
- [employee-dashboard.html](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/dashboards/employee-dashboard.html)
- [admin-dashboard.html](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/dashboards/admin-dashboard.html)

## Current HTML Load Pattern
Each main page loads:
1. Flatpickr from CDN
2. [pickers-init.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/pickers-init.js)

That means picker behavior is available on the home page and both dashboards.

## Date Picker Behavior
- The script targets every `input[type="date"]`.
- It enforces picker-only input by making the field read-only and blocking paste/drop/manual typing.
- It initializes Flatpickr with:
  - `dateFormat: "Y-m-d"`
  - `minDate` set to local midnight for the current day
  - `allowInput: false`
  - `parseDate: parseISO8601`
- Existing helper functions still expose the Flatpickr instance when other scripts need to read or set the value.

## Time Picker Behavior
- The script targets every `input[type="time"]`.
- Each time input is converted into a custom 12-hour popup flow by `createModernTimePicker(timeInput)`.
- The visible input becomes a read-only text field.
- The original 24-hour value is preserved in `data-time24`.
- The popup contains:
  - hour controls
  - minute controls
  - AM/PM toggle
  - Done button
- On confirmation, the input dispatches a `change` event so existing form logic keeps working.

## Select Enhancement Behavior
- The script adds `is-open` classes to native `<select>` elements based on focus, click, pointer, and keyboard state.
- This is a visual enhancement only.
- The browser still owns the real native select interaction.
- Outside clicks clear the temporary `is-open` state.

## Exported Helper Functions
The file still exposes helpers for non-module environments and test environments:
- `getDatePickerInstance`
- `setDatePickerValue`
- `clearDatePicker`
- `getDatePickerValue`
- `onDatePickerChange`
- `initializeModernPickers`
- `createModernTimePicker`

## Important Integration Notes
- Other scripts must treat time inputs as picker-managed fields.
- When a script wants the real 24-hour value, it should read the field through helper logic already used in formatting and booking flows.
- The picker layer is shared by home login-related inputs and dashboard booking/edit forms.

## What Changed Compared To Older Docs
- Pickers are not described as living under `frontend/html/...`.
- The implementation is not tied to removed monolith files.
- The date picker still uses Flatpickr, but the time picker is custom and owned by [pickers-init.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/pickers-init.js).

## Conclusion
The picker system is current and modular: Flatpickr owns date selection, the app owns time selection, and all three entry pages load the same picker runtime so booking forms stay consistent.
