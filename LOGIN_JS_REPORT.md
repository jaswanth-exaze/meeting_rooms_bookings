# login.js Report

## File
- `frontend/js/login.js`

## Purpose
Handles sign-in on `frontend/home.html`:
- validates login form inputs
- calls backend login API
- stores employee profile locally for UI personalization
- redirects to correct dashboard

## API Integration
- API base URL from `window.APP_CONFIG.API_BASE_URL`.
- Endpoint: `POST /auth/login`
- Uses `credentials: "include"` so backend can set HttpOnly auth cookie.

## Authentication Behavior
- Does **not** persist JWT token in localStorage.
- Stores only `auth_employee` in localStorage.
- Clears old `auth_token` key if present (legacy cleanup).
- Redirects:
  - admin -> `dashboards/admin-dashboard.html`
  - employee -> `dashboards/employee-dashboard.html`
- If backend flags `password_reset_required`, app redirects with `?force_password_change=1`.

## Error Handling
- Backend message is shown in `#auth-message`.
- Network/API failures are surfaced to user-friendly text.

## UX & Accessibility Updates (2026-03-04)
- Login form now uses visible field labels for email and password (not placeholder-only input UX).
- Dead `Reset` anchor (`href="#"`) was removed from home login card.
- Replaced with production-safe guidance text: `Contact your admin to reset it.`
- Added live region semantics (`role="status"`, `aria-live="polite"`) to auth feedback text so success/error updates are announced by assistive technologies.

## Dependencies
- Requires `frontend/js/config.js` loaded before `login.js`.
