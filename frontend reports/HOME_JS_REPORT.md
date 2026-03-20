# Home Frontend Report

## Updated
- March 18, 2026

## Important Correction
There is no longer a live `frontend/js/home.js` file.

The current home experience is split across dedicated home modules and started by `frontend/js/entry/home-entry.js`.

## Current Home Runtime Files
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
- `frontend/js/entry/home-entry.js`

## Current Responsibilities

### Page Startup
- `home-entry.js` calls `initializeHome()`
- `home-init.js` starts theme handling, page behavior, room loading, map loading, slideshow setup, and sticky auth-card behavior

### Theme
- `home-theme.js` owns dark/light toggle behavior for the public home page

### Public Page Behavior
- `home-page-behavior.js` handles the sign-in illustration video and sticky auth card behavior
- `home-hero.js` handles the hero slideshow

### Room Discovery
- `home-rooms.js` loads rooms, renders featured room cards, fills location filters, and opens the room detail modal
- `home-room-utils.js` formats room display text, amenities, and room metadata

### Map And Room Modals
- `location-map-modal.js` owns the office map preview and full map modal
- `home-room-modal.js` owns the room detail modal
- `home-modal-utils.js` owns focus helpers for home-page modals

## Current API Usage
The home feature scripts currently use:
- `GET /locations`
- `GET /rooms`

These requests are built from `window.APP_CONFIG.API_BASE_URL`, which is provided by `frontend/js/core/config.js`.

## What The Home Page Does Not Do Anymore
- It is not described as a single combined controller file
- It does not own dashboard booking management
- It does not create bookings directly from the public room cards

Login on the home page is handled separately by `frontend/js/auth/login.js`.

## Related Non-Home Scripts Loaded On The Page
- `frontend/js/core/config.js`
- `frontend/js/auth/login.js`
- `frontend/js/auth/pickers-init.js`

## Conclusion
The home page is now a modular frontend surface focused on public discovery, login entry, map exploration, and room detail presentation. The old `home.js` description is obsolete and has been replaced by the file map above.
