# Login Frontend Report

## Updated
- March 18, 2026

## Live File
- `frontend/js/auth/login.js`

## Page
- `frontend/home.html`

## Important Correction
The login script is no longer documented as `frontend/js/login.js`.

The live file is `frontend/js/auth/login.js`.

## Current Responsibilities
- read `#login-form`
- validate that email and password inputs exist
- prevent empty submission
- submit credentials to the backend login endpoint
- store the returned employee profile cache
- redirect to the correct dashboard

## Current Dependencies
- `frontend/js/core/config.js` must load before `frontend/js/auth/login.js`
- `#login-form` must exist on the page
- `#auth-message` is used for user-visible error messages when available

## Current Network Behavior
- The script uses direct `fetch`
- It sends `POST /auth/login`
- It sets `credentials: "include"` so the backend can issue the auth cookie
- It sends JSON with `email` and `password`

## Current Storage Behavior
- Removes legacy `auth_token` if present
- Stores only `auth_employee` in localStorage
- Does not manage authenticated dashboard requests after login

## Current Redirect Rules
- Admin users go to `dashboards/admin-dashboard.html`
- Non-admin users go to `dashboards/employee-dashboard.html`
- If `password_reset_required === true`, the redirect includes `?force_password_change=1`

## Current Error Handling
- Empty fields trigger an alert
- Backend or network failure surfaces the returned message in `#auth-message`
- If `#auth-message` does not exist, the script falls back to `alert`

## What This File Does Not Do
- It does not use `apiFetch`
- It does not validate the session after redirect
- It does not own dashboard role gating

Those concerns are handled later by:
- `frontend/js/core/api.js`
- `frontend/js/core/state.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`

## Conclusion
The current login flow is a small, page-specific script at `frontend/js/auth/login.js`. It handles sign-in, cookie-authenticated login submission, and dashboard redirect, then hands off all authenticated behavior to the dashboard runtime.
