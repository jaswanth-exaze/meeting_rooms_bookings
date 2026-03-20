# Dark Mode Implementation Report

## Updated
- March 18, 2026

## Audience
This document is written for a fresher developer who needs to understand the current dark-mode implementation exactly as it works in the codebase today.

## Goal
Explain:
- where dark mode is initialized
- what happens exactly when the user clicks the dark-mode button
- what changes in the DOM
- what changes in browser storage
- what happens on the next page load
- how home and dashboard implementations are similar and different

## Current Source Files

### Home Side
- `frontend/js/home/core/home-constants.js`
- `frontend/js/home/theme/home-theme.js`
- `frontend/js/home/init/home-init.js`
- `frontend/js/entry/home-entry.js`
- `frontend/home.html`

### Dashboard Side
- `frontend/js/dashboard/shared/theme/dashboard-theme.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/entry/dashboard-entry.js`
- `frontend/dashboards/employee-dashboard.html`
- `frontend/dashboards/admin-dashboard.html`

## Current Storage Key
- Home uses `THEME_STORAGE_KEY` from `frontend/js/home/core/home-constants.js`
- Dashboard uses `DASHBOARD_THEME_STORAGE_KEY` inside `frontend/js/dashboard/shared/theme/dashboard-theme.js`
- Both point to the same literal string:
  - `dashboard_theme_preference`

This means:
- if you select dark mode on the home page, the dashboard can reuse that preference on the next load
- if you select light mode on the dashboard, the home page can reuse that preference on the next load

## Very Important Architectural Note
There is no single old theme controller anymore.

Dark mode is now page-owned:
- home pages use `frontend/js/home/theme/home-theme.js`
- dashboard pages use `frontend/js/dashboard/shared/theme/dashboard-theme.js`

That split is intentional because the home page and dashboard do not load the same full script stack.

## Where The Theme Button Comes From
All current pages use the same button id:
- `themeToggleBtn`

The theme scripts read it using:
- `document.getElementById("themeToggleBtn")`

If this button is missing, the page can still apply the saved theme, but the toggle button itself cannot update its text or accessibility attributes.

## Startup Flow Before Any Click Happens

### Home Page Startup
1. `frontend/js/entry/home-entry.js` runs.
2. It calls `initializeHome()`.
3. `initializeHome()` immediately calls `initializeThemeToggle()` from `frontend/js/home/theme/home-theme.js`.
4. `initializeThemeToggle()` decides the initial theme:
   - first choice: stored theme from localStorage
   - fallback: browser system preference from `prefers-color-scheme`
5. It applies that theme once on page load.
6. It then attaches the click listener to `#themeToggleBtn`.

### Dashboard Startup
1. `frontend/js/entry/dashboard-entry.js` runs.
2. It calls `initializeDashboard()`.
3. `initializeDashboard()` validates session first.
4. If authentication is valid, it calls `initializeThemeToggle()` from `frontend/js/dashboard/shared/theme/dashboard-theme.js`.
5. That function:
   - reads saved preference first
   - falls back to `prefers-color-scheme`
   - applies the current theme
   - attaches the click listener to `#themeToggleBtn`

## Exact Click Flow: What Happens When You Click Dark Mode

This is the exact runtime story after initialization has already happened and the button listener is attached.

### Home Page Click Flow
When the user clicks the theme button on home:

1. The click listener inside `initializeThemeToggle()` runs.
2. The script calls `getActiveTheme()`.
3. `getActiveTheme()` checks:
   - `document.body.classList.contains("theme-dark")`
4. If the page is currently light:
   - `getActiveTheme()` returns `light`
5. The click handler computes the next theme:
   - current `light` -> next `dark`
   - current `dark` -> next `light`
6. The click handler calls:
   - `applyTheme(nextTheme)`
7. `applyTheme()` normalizes the incoming value:
   - only `dark` is treated as dark
   - anything else becomes `light`
8. `applyTheme()` then updates the page state:
   - toggles `document.body.classList` with `theme-dark`
   - sets `document.body.dataset.theme`
   - sets `document.documentElement.style.colorScheme`
   - updates the button text and ARIA state through `setThemeToggleButtonState()`
9. Because `persist` defaults to `true`, it writes the selected theme into localStorage under `dashboard_theme_preference`

### Dashboard Click Flow
When the user clicks the theme button on the employee or admin dashboard:

1. The click listener inside dashboard `initializeThemeToggle()` runs.
2. The script calls `getActiveDashboardTheme()`.
3. That function checks:
   - `document.body.classList.contains("theme-dark")`
4. The next theme is computed:
   - current `light` -> next `dark`
   - current `dark` -> next `light`
5. The click handler calls:
   - `applyDashboardTheme(nextTheme)`
6. `applyDashboardTheme()` normalizes the value.
7. It updates:
   - `document.body.classList`
   - `document.body.dataset.theme`
   - `document.documentElement.style.colorScheme`
   - toggle button text and accessibility state
8. It writes the selected value into localStorage under the same key: `dashboard_theme_preference`

## What Changes In The DOM After The Click
After the click, these are the important live DOM changes:

### 1. `document.body.classList`
- The class `theme-dark` is added when dark mode is active
- The class `theme-dark` is removed when light mode is active

This is the main CSS trigger for dark styling.

### 2. `document.body.dataset.theme`
- becomes `dark` in dark mode
- becomes `light` in light mode

This gives CSS and debugging tools a simple theme marker on the page.

### 3. `document.documentElement.style.colorScheme`
- becomes `dark` or `light`

This matters because browsers use `color-scheme` to decide how some native UI should behave, including form controls and scrollbars in supported environments.

### 4. Theme Button State
The button text is updated:
- dark mode active -> button text becomes `Light Mode`
- light mode active -> button text becomes `Dark Mode`

ARIA also changes:
- `aria-pressed`
- `aria-label`

That is important for accessibility and for clearly communicating the current toggle state.

## What Changes In Browser Storage
On a normal click, localStorage is updated:

- key: `dashboard_theme_preference`
- value: `dark` or `light`

This is why the preference survives page reloads.

## What Does Not Happen On Click
When dark mode is toggled, the app does **not**:
- call the backend
- send a fetch request
- reload the page
- swap CSS files
- rebuild the whole page
- change authentication state

The theme switch is a pure client-side UI state change plus a localStorage write.

## What Happens On The Next Page Load
On the next load:

1. The theme initializer runs again.
2. It checks localStorage first.
3. If a valid stored theme exists, that theme wins.
4. If nothing is stored, the script falls back to system theme using `window.matchMedia("(prefers-color-scheme: dark)")`.

So the priority order is:
1. saved user preference
2. system preference

## What Happens If System Theme Changes
Both home and dashboard register a `matchMedia` listener.

That listener only updates the page when:
- there is **no** stored preference

Why?
- because once a user explicitly chose a theme, the app treats that choice as stronger than the OS/browser preference

So:
- no saved theme -> system theme changes can auto-update the page
- saved theme exists -> system theme changes are ignored

## Function-By-Function Responsibility

### Home Functions
- `getStoredTheme()`
  - reads localStorage and returns only valid theme values
- `getSystemTheme()`
  - checks browser preference
- `getActiveTheme()`
  - reads current DOM theme state from `body`
- `setThemeToggleButtonState(theme)`
  - updates visible button text and accessibility attributes
- `applyTheme(theme, { persist = true } = {})`
  - performs the real DOM update and optionally stores the choice
- `initializeThemeToggle()`
  - applies the first theme and wires the click and system-theme listeners

### Dashboard Functions
- `getStoredDashboardTheme()`
- `getSystemDashboardTheme()`
- `getActiveDashboardTheme()`
- `setThemeToggleButtonState(theme)`
- `applyDashboardTheme(theme, { persist = true } = {})`
- `initializeThemeToggle()`

These do the same kind of job as the home equivalents, but inside the dashboard shared layer.

## Why The Home And Dashboard Files Are Similar
A fresher may ask:
"Why are these two files so similar? Why not one shared file?"

Senior-developer answer:
- the behavior is conceptually shared
- but the load contexts are different
- the home page uses home constants
- the dashboard has its own shared shell layer
- keeping them separate reduces accidental coupling between public page code and authenticated dashboard code
- it also keeps ownership easy to understand: home owns home theme, dashboard owns dashboard theme

## Where The Real Visual Change Comes From
The JavaScript does not directly paint colors.

JavaScript only flips the state markers:
- `theme-dark` class
- `data-theme`
- `colorScheme`

The actual colors come from CSS that reacts to those markers.

So when a fresher says:
"Dark mode happens because of JavaScript"

The more correct senior answer is:
- JavaScript selects the theme state
- CSS renders the visual theme

## Debug Checklist For A Fresher
If dark mode is not working, check in this order:

1. Does the page contain `#themeToggleBtn`?
2. Is the correct theme script loaded for that page?
3. Does clicking the button change `localStorage.dashboard_theme_preference`?
4. Does `document.body` gain or lose `theme-dark`?
5. Does `document.body.dataset.theme` change?
6. Does the button text switch between `Dark Mode` and `Light Mode`?
7. Does the CSS actually define dark styles for `.theme-dark` or theme-based selectors?

## Final Summary
When you click dark mode, the current page does a small, exact chain of client-side work:

1. read current theme from `body`
2. calculate the opposite theme
3. apply that theme to DOM state
4. update the toggle button text and accessibility attributes
5. save the preference in localStorage

That is the whole mechanism.

The reason it feels global is that home and dashboard both reuse the same storage key, so the next page load can read the same saved preference and apply it immediately.
