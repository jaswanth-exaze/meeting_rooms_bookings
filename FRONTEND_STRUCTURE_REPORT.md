# Frontend File Structure Report

This report documents the frontend structure in this repository, explains why this structure is a good fit compared to common alternatives, and describes the purpose of every file under `frontend/`.

## Goals of the Structure

The frontend is built to be:

- Simple to read without a build step.
- Easy to navigate by feature and by page.
- Modular enough to avoid large, brittle files.
- Safe to extend without breaking unrelated pages.

## High-Level Structure and Load Order

At runtime, each page loads scripts in a predictable order:

1. `core/` first for shared config, state, formatting, DOM helpers, pagination, and API utilities.
2. `ui/` for shared UI behaviors like theme toggles, sidebar drawer, navigation, and modals.
3. Page-specific feature modules such as dashboard sections or home sections.
4. `init/` modules to wire up events and data loading.
5. `entry/` modules to call the initializer for that page.

This keeps dependencies explicit and lets each script assume that the shared utilities are already present on the page.

## Why This Structure Is Better Than Common Alternatives

Compared to a single monolithic JS file:

- It avoids merge conflicts and makes changes easier to review.
- Each file has a clear responsibility, which reduces accidental side effects.
- You can find logic faster because the file names map to the UI sections.

Compared to a "page-per-file" structure with duplicated logic:

- Shared behavior is centralized in `core/` and `ui/`, so fixes apply everywhere.
- The dashboards share the same base utilities while still allowing role-specific features.
- The home page is isolated into its own folder to avoid cross-page clutter.

Compared to a full framework and bundler setup:

- This structure keeps the project deployable as static files with no build step.
- It is easier for new team members to debug because every file runs in the browser as-is.
- It keeps the mental model simple while still being modular.

The tradeoff is that global scope is shared. That is acceptable here because scripts are loaded in a strict order and the files are kept small and focused.

## Suggested Improvements

These are optional refinements that keep the current simplicity:

- Add a short "dependency header" comment in each file for clarity, for example "Requires: core/state.js, core/api.js".
- Consider moving the two image files sitting in `frontend/` root into `frontend/assets/images/` or removing them if unused.
- If the JS surface grows further, consider wrapping each module in an IIFE to reduce accidental global leakage, without introducing a build step.
- If the team ever wants linting, add a simple ESLint config to enforce consistency.

## File-by-File Descriptions

### Root HTML

- `frontend/home.html`  
  Public landing page. Hosts the hero slideshow, featured rooms list, map preview modal, and login form. Loads the home-specific scripts and shared login and picker scripts.

- `frontend/dashboards/admin-dashboard.html`  
  Admin dashboard page. Includes admin-only sections for reports, employee management, and room management along with shared dashboard sections (overview, bookings, room finder, profile).

- `frontend/dashboards/employee-dashboard.html`  
  Employee dashboard page. Includes only the shared dashboard sections and excludes admin modules. Keeps the UI lean for non-admin users.

### Root Images (Legacy or External Use)

- `frontend/image(1).png`  
  Standalone image in the frontend root. Likely legacy or temporary. Consider moving to `assets/images` if it is used.

- `frontend/image_4_-removebg-preview.png`  
  Standalone image in the frontend root. Likely legacy or temporary. Consider moving to `assets/images` if it is used.

### CSS Entry and Shared Styles

- `frontend/css/styles.css`  
  CSS entry point. Imports the rest of the CSS files so HTML can include a single stylesheet.

- `frontend/css/common.css`  
  Global tokens, reset styles, base typography, core components, and shared layout. Contains most shared UI styles including cards, buttons, form elements, and home layout styles.

- `frontend/css/admin.css`  
  Admin dashboard-only overrides such as report grid and admin modal sizing.

- `frontend/css/employee.css`  
  Employee dashboard-only overrides. Currently a placeholder for future employee-only styling.

- `frontend/css/picker.css`  
  Styles for the participant picker and related chips and suggestion lists.

- `frontend/css/picker-date.css`  
  Styles for the Flatpickr date picker and native date input overrides.

- `frontend/css/picker-time.css`  
  Styles for the Flatpickr time picker and the custom modern time picker component.

### JavaScript: Entry Points

- `frontend/js/entry/home-entry.js`  
  Home page entry. Calls `initializeHome()` after all home modules load.

- `frontend/js/entry/dashboard-entry.js`  
  Dashboard entry. Calls `initializeDashboard()` for both admin and employee dashboards.

### JavaScript: Auth

- `frontend/js/auth/login.js`  
  Home page login flow. Submits credentials, stores the employee in local storage, and redirects to the correct dashboard based on role.

- `frontend/js/auth/pickers-init.js`  
  Initializes Flatpickr date inputs and a custom time picker component. Also improves select dropdown UI states.

### JavaScript: Core Utilities

- `frontend/js/core/config.js`  
  Computes `APP_CONFIG.API_BASE_URL` at runtime based on host, meta tags, or override. Central config for all API calls.

- `frontend/js/core/state.js`  
  Holds shared runtime state for the dashboard, including current employee, role, IDs, and data maps used across modules. Also manages role enforcement and auth clearing.

- `frontend/js/core/api.js`  
  Central fetch wrapper for API calls. Handles credentials, JSON parsing, auth failure redirect, and shared URL builders.

- `frontend/js/core/format.js`  
  Shared formatting and data helpers. Includes time formatting, room feature labels, availability helpers, schedule calculations, and small normalization utilities.

- `frontend/js/core/dom.js`  
  DOM helpers and shared UI utilities such as skeleton markup, helper messages, and refresh timestamps.

- `frontend/js/core/pagination.js`  
  Pagination state helpers and control rendering shared across dashboards and reports.

### JavaScript: UI Shell

- `frontend/js/ui/theme.js`  
  Theme toggling for dashboards, including storage, system theme sync, and button state updates.

- `frontend/js/ui/sidebar.js`  
  Sidebar drawer open/close logic for dashboard layouts with responsive handling.

- `frontend/js/ui/nav.js`  
  Section navigation, jump links, and logout behavior within dashboard pages.

- `frontend/js/ui/modals.js`  
  Centralized modal behavior for the dashboard. Includes focus trapping, booking edit modal, room booking modal, schedule modal, and participant picker flows.

### JavaScript: Dashboard Header

- `frontend/js/dashboard/header/header-labels.js`  
  Sets the "Today" label and header text based on the logged-in user.

- `frontend/js/dashboard/header/header-profile.js`  
  Populates the profile section, password change logic, and related UI hints.

### JavaScript: Dashboard Overview

- `frontend/js/dashboard/overview/overview-load.js`  
  Loads summary metrics for the dashboard top cards.

- `frontend/js/dashboard/overview/overview-render.js`  
  Renders the upcoming booking table for the overview section.

### JavaScript: Dashboard Bookings

- `frontend/js/dashboard/bookings/bookings-load.js`  
  Fetches and hydrates overview bookings and the full bookings table. Also supports refresh flows.

- `frontend/js/dashboard/bookings/bookings-render.js`  
  Renders booking rows and pagination for the bookings table.

- `frontend/js/dashboard/bookings/bookings-actions.js`  
  Determines booking permissions, available actions, and builds action controls per row.

### JavaScript: Dashboard Room Finder

- `frontend/js/dashboard/room-finder/finder-form.js`  
  Manages room finder form inputs, date/time constraints, and form submission wiring.

- `frontend/js/dashboard/room-finder/finder-render.js`  
  Renders the room finder results table and pagination.

- `frontend/js/dashboard/room-finder/finder-availability.js`  
  Fetches availability data, renders the availability list, and executes searches.

### JavaScript: Dashboard Admin Modules

- `frontend/js/dashboard/admin/admin-employees.js`  
  Admin employee directory, filters, pagination, add employee modal, and delete flow.

- `frontend/js/dashboard/admin/admin-rooms.js`  
  Admin room directory, filters, add room modal, and room listing.

- `frontend/js/dashboard/admin/admin-reports.js`  
  Admin reporting tables for location and upcoming bookings.

### JavaScript: Dashboard Init

- `frontend/js/dashboard/init/dashboard-init.js`  
  Main initializer for dashboards. Enforces auth, wires UI modules, and loads all initial data. Calls admin initialization only on the admin dashboard.

### JavaScript: Home Core

- `frontend/js/home/core/home-constants.js`  
  Home page constants such as image maps, amenity definitions, SVG icons, map presets, and theme constants.

- `frontend/js/home/core/home-dom.js`  
  Central DOM lookups for the home page. Keeps selectors and IDs in one place.

- `frontend/js/home/core/home-utils.js`  
  Home utilities including theme toggle, sign-in video controls, sticky auth card logic, modal focus handling, and room detail rendering helpers.

### JavaScript: Home Sections

- `frontend/js/home/sections/home-rooms.js`  
  Featured rooms list, filtering, room card creation, and room data loading.

- `frontend/js/home/sections/home-map.js`  
  Leaflet map preview, full map modal logic, and location selection with room lists.

- `frontend/js/home/sections/home-room-modal.js`  
  Home room detail modal open/close logic with keyboard and focus handling.

- `frontend/js/home/sections/home-hero.js`  
  Hero slideshow autoplay logic for the home page video carousel.

### JavaScript: Home Init

- `frontend/js/home/init/home-init.js`  
  Home initializer. Loads rooms and locations, wires up the slideshow and sticky auth card behavior.

### Assets: Images

- `frontend/assets/images/boardroom-15-members.png`  
  Room preview image for boardroom spaces.

- `frontend/assets/images/cell_pod_1.png`  
  Room preview image for cell pod 1.

- `frontend/assets/images/cell_pod_2.png`  
  Room preview image for cell pod 2.

- `frontend/assets/images/Conference_Room_A.png`  
  Room preview image for conference room A.

- `frontend/assets/images/Conference_Room_B.png`  
  Room preview image for conference room B.

- `frontend/assets/images/exaze-logo-for-head.png`  
  Brand logo for header or larger placements.

- `frontend/assets/images/exaze-logo.png`  
  Standard brand logo used in home and dashboard.

- `frontend/assets/images/female_profile.png`  
  Default female profile avatar.

- `frontend/assets/images/fussion-6-members.png`  
  Room preview image for six-person rooms.

- `frontend/assets/images/home_page_image.png`  
  Home page imagery used in featured sections or cards.

- `frontend/assets/images/home_page_image_1.png`  
  Home page imagery variant.

- `frontend/assets/images/home_page_image_2.png`  
  Home page imagery variant.

- `frontend/assets/images/home_page_image_3.png`  
  Home page imagery variant.

- `frontend/assets/images/home_page_image_4.png`  
  Home page imagery variant.

- `frontend/assets/images/hubble-2-persons.png`  
  Room preview image for two-person rooms.

- `frontend/assets/images/image(3).png`  
  Default fallback room image.

- `frontend/assets/images/Innovation_Hub.png`  
  Room preview image for innovation hub.

- `frontend/assets/images/male_profile.png`  
  Default male profile avatar.

- `frontend/assets/images/Nexus-2-persons.png`  
  Room preview image for two-person rooms.

- `frontend/assets/images/pinnacle-15-members.png`  
  Room preview image for large rooms.

- `frontend/assets/images/synergy-4-members.png`  
  Room preview image for four-person rooms.

- `frontend/assets/images/think_tank.png`  
  Room preview image for think tank rooms.

- `frontend/assets/images/training_room.png`  
  Room preview image for training rooms.

- `frontend/assets/images/tranquil-5-members.png`  
  Room preview image for five-person rooms.

- `frontend/assets/images/zenith-3-persons.png`  
  Room preview image for three-person rooms.

### Assets: Videos

- `frontend/assets/videos/home_page_hero_video.mp4`  
  Main hero slideshow video on the home page.

- `frontend/assets/videos/home_page_hero_video_1.mp4`  
  Hero slideshow variant video.

- `frontend/assets/videos/home_page_hero_video_2.mp4`  
  Hero slideshow variant video.

- `frontend/assets/videos/home_page_hero_video_3.mp4`  
  Hero slideshow variant video.

- `frontend/assets/videos/home_page_hero_video_4.mp4`  
  Hero slideshow variant video.

- `frontend/assets/videos/home_page_hero_video_8.mp4`  
  Hero slideshow variant video.

- `frontend/assets/videos/mini-illustration-sign-in.mp4`  
  Home page sign-in side panel video loop.

