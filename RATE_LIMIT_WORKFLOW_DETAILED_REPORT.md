# Rate Limit Workflow Report (Detailed)

## 1. Purpose
This report explains how rate limiting works in this project today, where it is applied, the exact request flow, what users experience, and what security/operational impact it has.

Scope covered:
- Backend middleware implementation
- Route wiring and middleware order
- Frontend behavior when 429 is returned
- Logging/observability
- Practical limitations in current design
- Recommended next improvements

## 2. Where It Is Implemented

Primary backend files:
- `backend/src/middleware/authRateLimit.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requestLogger.js`

Frontend files involved in user-visible behavior:
- `frontend/js/login.js`
- `frontend/js/role-dashboard.js`

## 3. Current Configuration (Hardcoded)
From `authRateLimit.js`:
- Window length: `WINDOW_MS = 15 * 60 * 1000` (15 minutes)
- Max attempts per key: `MAX_ATTEMPTS = 10`
- Cleanup trigger threshold: `STORE_MAX_SIZE = 10000`
- Storage type: in-memory `Map`

Important: these values are currently hardcoded in code (not from `.env`).

## 4. Which Endpoints Are Rate Limited
From `auth.routes.js`:
- `POST /api/auth/login` -> `authRateLimit` runs before `login` controller
- `POST /api/auth/change-password` -> `requireAuth` runs first, then `authRateLimit`, then `changePassword`

Not rate-limited currently:
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 5. How Request Keys Are Built
The key builder in `authRateLimit.js` does:
1. Read IP from `req.ip` (fallback `req.connection.remoteAddress`, then `"unknown"`)
2. Read `req.body.email`, trim, lowercase
3. If email exists: key is `"<ip>:<email>"`
4. If email missing: key is only `"<ip>"`

### What this means in practice
- Login attempts are bucketed by IP + normalized email.
- For requests that do not send email in body (for example `change-password` payload uses `current_password` and `new_password`), the bucket becomes IP-only.

## 6. Exact Workflow (Step by Step)

### 6.1 Every incoming auth-limited request
1. Middleware gets current timestamp (`now = Date.now()`).
2. `cleanup(now)` runs only if map size has reached 10,000 keys.
3. A key is built (IP+email or IP).
4. Existing entry is looked up in the map.

### 6.2 If key is new or expired
- Create/reset entry:
  - `count = 1`
  - `resetAt = now + 15 minutes`
- Request is allowed (`next()`).

### 6.3 If key exists and window is active
- Increment `count` by 1.
- If `count <= 10`: request is allowed.
- If `count > 10`: request is blocked with:
  - HTTP status `429`
  - Header `Retry-After: <remaining_seconds>`
  - JSON body:
  ```json
  {
    "message": "Too many authentication attempts. Please try again shortly."
  }
  ```

### 6.4 Window reset behavior
- After `resetAt` passes, next attempt starts a fresh window with `count=1`.

## 7. Attempt Counting Semantics
Important behavior in current implementation:
- Counting happens before credential verification.
- Both successful and failed requests consume attempts.

So within one window:
- Attempts 1 to 10 are processed normally.
- Attempt 11 and later are blocked until the reset time.

## 8. End-to-End Flow for Login (Current Project)

### Client side (`frontend/js/login.js`)
1. User submits email/password.
2. Browser sends `POST /api/auth/login` with JSON body and `credentials: include`.
3. If response is non-2xx, frontend throws error using `data.message`.
4. For 429, user sees server message in the login message area.

### Server side
1. Route stack: `authRateLimit` -> `login` controller.
2. If not over threshold, login logic runs (DB lookup + password verification).
3. On valid credentials, backend sets HttpOnly auth cookie and returns employee payload.
4. On invalid credentials, backend returns 401.
5. On over-threshold, backend returns 429 before controller executes.

## 9. End-to-End Flow for Change Password (Current Project)

### Client side (`frontend/js/role-dashboard.js`)
1. Authenticated user submits current/new password.
2. Browser calls `POST /api/auth/change-password` via `apiFetch`.
3. Non-2xx messages are shown in profile security section.

### Server side
1. Route stack: `requireAuth` -> `authRateLimit` -> `changePassword`.
2. If session invalid, request ends at 401 before rate limiter.
3. If session valid, rate limiter runs.
4. Because payload has no `email`, current key becomes IP-only.
5. If under threshold, password change logic runs.
6. If over threshold, 429 returned.

Operational impact:
- Multiple authenticated users behind same NAT/proxy IP can share the same change-password limit bucket.

## 10. Logging and Observability
`requestLogger` logs every request on response finish, including:
- request id
- method
- path
- status code
- duration
- IP

For rate-limit events this gives:
- Clear `429` visibility in logs
- Correlation through `X-Request-Id` for support/debugging

Current gap:
- No dedicated security event log entry from `authRateLimit` itself (only generic request log).

## 11. Security Value Provided Today
Rate limiting currently helps by:
- Slowing brute-force login attempts on specific account/email from an IP.
- Reducing high-volume auth abuse load on DB + password hashing path.
- Creating a timed lockout window via standard HTTP 429 and `Retry-After`.

## 12. Known Limitations in Current Design

### 12.1 In-memory storage only
- Rate-limit state is lost on process restart.
- In horizontal scaling (multiple backend instances), each instance tracks limits independently.

### 12.2 IP identity quality
- If deployed behind reverse proxy/load balancer and `trust proxy` is not configured correctly, `req.ip` may not represent real client IP.

### 12.3 Change-password keying
- `change-password` currently keys by IP only because no email is sent in request body.
- Can cause shared throttling among users from same office/network.

### 12.4 Cleanup behavior
- Expired entries are purged only when map size reaches 10,000.
- Under that size, expired keys can remain in map until accessed again.

### 12.5 No adaptive or endpoint-specific policy
- Same max/window for login and change-password.
- No progressive backoff per repeated abuse pattern.

### 12.6 Frontend does not use `Retry-After`
- UI shows error message but does not display countdown timer from response header.

## 13. Recommended Improvements (Prioritized)

### Priority 1 (High impact, low-medium effort)
1. Make rate-limit settings environment-driven.
   - Example vars: `AUTH_RATE_WINDOW_MS`, `AUTH_RATE_MAX_ATTEMPTS`.
2. Use better key for change-password.
   - Prefer authenticated user id key (e.g. `employee_id`) plus IP fallback.
3. Expose friendly UI cooldown.
   - Parse `Retry-After` and show `Try again in X seconds` on login/profile forms.

### Priority 2 (Production hardening)
1. Move store to Redis (shared distributed limiter).
2. Configure `app.set("trust proxy", 1)` (or deployment-specific value) when behind trusted proxy.
3. Add dedicated security logs for throttle events with key metadata (without sensitive data).

### Priority 3 (Advanced defenses)
1. Split policies by endpoint:
   - tighter for login
   - separate policy for change-password
2. Add temporary account-level lock strategy after repeated bad passwords.
3. Add alerting dashboards on spike in 429 on auth endpoints.

## 14. Example Timeline (How User Hits Limit)
Assume one user/IP+email bucket:
- 10:00:00: attempt #1 -> allowed
- 10:05:00: attempt #5 -> allowed
- 10:11:30: attempt #10 -> allowed
- 10:12:00: attempt #11 -> blocked with 429
- 10:12:00 response includes `Retry-After` (seconds until ~10:15:00)
- 10:15:01: next attempt starts new window -> allowed as count resets to 1

## 15. File References Used For This Report
- `backend/src/middleware/authRateLimit.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requestLogger.js`
- `frontend/js/login.js`
- `frontend/js/role-dashboard.js`

## 16. Executive Summary
Your current rate limiting is functional and correctly blocks excessive auth attempts using standard 429 + `Retry-After`. It already provides meaningful protection for login abuse. The biggest practical gap is that `change-password` is effectively IP-bucketed today (because key uses `req.body.email`), and the limiter is in-memory only, so it is not consistent across restarts/multi-instance deployments. Addressing key strategy + shared store will make it production-grade for enterprise scale.
