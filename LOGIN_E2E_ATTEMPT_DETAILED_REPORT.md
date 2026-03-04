# Login Attempt End-to-End Detailed Report

## 1) Objective
This document describes the complete login lifecycle across frontend and backend, including:
- login submission
- authentication decision path
- session creation
- dashboard entry validation
- forced password reset behavior
- error and redirect behaviors

Scope files:
- `frontend/js/login.js`
- `frontend/dashboard.html`
- `frontend/js/role-dashboard.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requireAuth.js`
- `backend/src/middleware/authRateLimit.js`

---

## 2) Frontend Login Attempt Flow

## 2.1 User action
User submits login form on `frontend/home.html`.

`frontend/js/login.js`:
1. reads email + password
2. validates non-empty
3. sends `POST /api/auth/login` with JSON body
4. sets `credentials: include` so browser accepts HttpOnly auth cookie

### Request format
```json
{
  "email": "user@example.com",
  "password": "UserPassword"
}
```

## 2.2 Frontend on success
If response is `200`:
1. `auth_employee` is stored in localStorage (profile info only)
2. legacy `auth_token` key is removed
3. redirect target is selected by role:
   - admin -> `dashboards/admin-dashboard.html`
   - employee -> `dashboards/employee-dashboard.html`
4. if backend says `password_reset_required: true`, query flag is appended:
   - `?force_password_change=1`

## 2.3 Frontend on failure
If response is non-200:
- message is shown in `#auth-message`
- no dashboard navigation

---

## 3) Backend Login Decision Path

Route chain:
- `POST /api/auth/login`
  - `authRateLimit`
  - `auth.controller.login`

### 3.1 Validation stage
Backend checks:
1. email present
2. password present
3. user lookup by normalized lowercase email

Failure outputs:
- `400` for missing fields
- `401` for invalid credentials / unknown email
- `429` for rate-limited attempts

### 3.2 Password verification stage
Backend supports two storage cases:
1. **bcrypt hash**: verify via `bcrypt.compare`
2. **legacy plaintext**: compare directly, then auto-upgrade to bcrypt

If legacy match occurs:
- password is immediately re-hashed
- stored hash updated
- `password_reset_required` set to `1`

### 3.3 Session creation stage
On successful auth:
1. JWT payload created with role/profile/reset flag
2. JWT placed in HttpOnly cookie (cookie name from env)
3. response returns employee object (no token string exposed to JS)

---

## 4) Session Validation After Redirect

Even after login success, dashboard must re-validate session.

`frontend/js/role-dashboard.js` startup:
1. calls `/api/auth/me` with cookies
2. if valid:
   - hydrates current employee state
   - enforces role-route match
3. if invalid:
   - clears local auth artifacts
   - redirects to home

This is why a user can briefly see dashboard and then return home if `/auth/me` fails.

Common reasons:
1. host mismatch (`localhost` vs `127.0.0.1`)
2. cookie not sent due to origin mismatch
3. expired cookie
4. CORS misalignment

---

## 5) Forced Password Reset Behavior

When `password_reset_required=true`:
1. login redirect includes `?force_password_change=1`
2. dashboard opens profile section for password change
3. user submits `/api/auth/change-password`
4. backend validates:
   - current password correctness
   - new password policy
5. backend updates hash, sets reset flag to `0`, reissues session cookie
6. frontend updates local profile state and removes query flag

Password policy currently enforces:
- min length 8
- lowercase
- uppercase
- number
- special character

---

## 6) Logout Flow

`role-dashboard.js` logout action:
1. calls `POST /api/auth/logout`
2. backend clears auth cookie
3. frontend clears local auth state
4. redirect to `home.html`

---

## 7) API Contracts (Auth)

## 7.1 `POST /api/auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "UserPassword"
}
```
Success response:
```json
{
  "message": "Login successful.",
  "employee": {
    "employee_id": 12,
    "name": "User",
    "email": "user@example.com",
    "department": "Engineering",
    "gender": "male",
    "is_admin": false,
    "password_reset_required": true
  }
}
```

## 7.2 `GET /api/auth/me`
Success response:
```json
{
  "employee": {
    "employee_id": 12,
    "name": "User",
    "email": "user@example.com",
    "department": "Engineering",
    "gender": "male",
    "is_admin": false,
    "password_reset_required": false
  }
}
```

## 7.3 `POST /api/auth/change-password`
Request:
```json
{
  "current_password": "OldPass@123",
  "new_password": "NewPass@123"
}
```
Success response:
```json
{
  "message": "Password changed successfully.",
  "employee": { "...updated profile..." }
}
```

---

## 8) Failure Matrix

1. Wrong email/password
- backend: 401
- frontend: shows login failed message

2. Too many attempts
- backend: 429
- frontend: shows throttling message

3. Login success but dashboard bounce to home
- login endpoint succeeded
- `/auth/me` failed
- frontend safety redirect to home

4. Change password rejected
- 400 policy violation or 401 current password mismatch
- message shown in profile form helper text

---

## 9) Diagnostics Checklist

If login works but dashboard bounces:
1. Check network:
   - login response status should be 200
   - `/auth/me` status should be 200 immediately after redirect
2. Check cookie:
   - `mrb_auth` exists
   - domain/host matches current frontend host
3. Verify `.env`:
   - `CORS_ORIGIN` includes exact frontend origin
4. Avoid mixed hosts in same session:
   - don’t login on `localhost` then open dashboard via `127.0.0.1`

---

## 10) Summary
The login system is now a secure cookie-session model with:
- backend authoritative session checks
- legacy-password migration path
- forced password reset support
- robust redirect safety behavior

The quick “open dashboard then bounce home” symptom is expected when session validation fails, and should be treated as an authentication/cookie/origin issue rather than UI routing alone.
