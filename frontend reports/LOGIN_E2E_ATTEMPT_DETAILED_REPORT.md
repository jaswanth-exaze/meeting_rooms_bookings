# Login End-to-End Detailed Report

## Updated
- March 18, 2026

## Purpose
This document describes the current login lifecycle across the modular frontend and backend.

## Current Files Involved

### Frontend
- `frontend/home.html`
- `frontend/js/core/config.js`
- `frontend/js/auth/login.js`
- `frontend/js/core/state.js`
- `frontend/js/core/api.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`
- `frontend/js/dashboard/shared/header/header-profile.js`
- `frontend/js/entry/dashboard-entry.js`

### Backend
- `backend/src/routes/auth.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requireAuth.js`
- `backend/src/middleware/authRateLimit.js`
- `backend/src/utils/password.js`

## Important Correction
The login lifecycle is no longer routed through a removed `frontend/js/role-dashboard.js`.

The dashboard handoff now goes through:
- `frontend/js/entry/dashboard-entry.js`
- `frontend/js/dashboard/shared/init/dashboard-init.js`

## Current End-To-End Flow

### 1. Home Page Loads
- `frontend/home.html` loads `frontend/js/core/config.js`
- the login form is present as `#login-form`
- `frontend/js/auth/login.js` attaches the submit handler

### 2. User Submits Credentials
- `login.js` reads `email` and `password`
- empty fields are blocked on the client
- the browser sends `POST /auth/login` using `credentials: "include"`

### 3. Backend Login Handling
- `authRateLimit` runs first
- `login` in `auth.controller.js` looks up the employee row
- `verifyPassword()` checks the password
- legacy plaintext passwords are upgraded to bcrypt on successful login
- the backend sets the auth cookie and returns the employee payload

### 4. Frontend Login Success Handling
- `login.js` removes the legacy `auth_token` key
- `login.js` stores `auth_employee`
- it chooses the dashboard target based on `employee.is_admin`
- if `password_reset_required === true`, it appends `?force_password_change=1`

### 5. Dashboard Entry
- the browser lands on either:
  - `frontend/dashboards/employee-dashboard.html`
  - `frontend/dashboards/admin-dashboard.html`
- `frontend/js/entry/dashboard-entry.js` calls `initializeDashboard()`

### 6. Session Validation
- `initializeDashboard()` immediately calls `ensureAuthenticatedSession()`
- `ensureAuthenticatedSession()` uses `apiFetch("/auth/me", { skipAuth: true })`
- the backend route is protected by `requireAuth`
- if the cookie is valid, the backend returns the authenticated employee payload
- `setCurrentEmployee()` refreshes the local employee cache
- `enforceRoleAccess()` verifies the user is on the correct dashboard

### 7. Dashboard Startup Continues
If session validation succeeds, the dashboard initializes:
- theme
- header/profile shell
- room finder
- booking modals
- participant picker
- admin features when applicable

Then it loads the first round of booking, summary, finder, and admin data.

## Current Forced Password Reset Behavior
- Login redirect includes `?force_password_change=1` when needed
- `frontend/js/core/state.js` reads that query flag into `forcePasswordChange`
- `initializeDashboard()` shows the profile section immediately when reset is required
- `frontend/js/dashboard/shared/header/header-profile.js` handles the password change form
- successful password change updates employee state and removes the query flag from the URL

## Current Failure Cases

### Login Failure
- invalid credentials -> backend returns `401`
- rate limit exceeded -> backend returns `429`
- `login.js` displays the returned message in `#auth-message`

### Session Failure After Redirect
- if `/auth/me` fails, `apiFetch` or `ensureAuthenticatedSession()` clears stored auth
- the browser is redirected back to `../home.html`

### Wrong Dashboard For Role
- `enforceRoleAccess()` redirects admins away from employee pages
- `enforceRoleAccess()` redirects employees away from admin pages

## Current Storage Model
- cookie carries authenticated session state
- localStorage carries only `auth_employee`
- old `auth_token` is treated as a legacy key and removed

## Conclusion
The current login lifecycle is split cleanly between `frontend/js/auth/login.js` for sign-in submission and `frontend/js/dashboard/shared/init/dashboard-init.js` plus `frontend/js/core/api.js` for post-login session validation.
