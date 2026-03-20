# Rate Limit Workflow Detailed Report

## Updated
- March 18, 2026

## Purpose
This report explains how authentication rate limiting works in the current codebase, which backend routes use it, and how the current frontend surfaces rate-limit failures.

## Current Backend Files
- [authRateLimit.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/backend/src/middleware/authRateLimit.js)
- [auth.routes.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/backend/src/routes/auth.routes.js)
- [auth.controller.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/backend/src/controllers/auth.controller.js)
- [requestLogger.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/backend/src/middleware/requestLogger.js)

## Current Frontend Callers
- Login submit flow: [frontend/js/auth/login.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/login.js)
- Authenticated password-change flow: [frontend/js/dashboard/shared/header/header-profile.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/header/header-profile.js)
- Shared authenticated request wrapper: [frontend/js/core/api.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/core/api.js)

## Routes Protected Today
- `POST /api/auth/login`
- `POST /api/auth/change-password`

These are wired in [auth.routes.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/backend/src/routes/auth.routes.js), where `authRateLimit` runs before the controller.

## How The Current Middleware Works
- Window length: `15` minutes
- Maximum attempts per window: `10`
- Storage model: in-memory `Map`
- Cleanup behavior: expired entries are removed when the store grows past the configured max size
- Retry hint: `Retry-After` response header is set when the limit is exceeded

## Current Keying Strategy
- If the request includes an email, the key is `ip:normalizedEmail`
- If no email is present, the key falls back to `ip`

That means repeated login attempts against one account from one address are grouped together.

## Current Login Flow
1. The browser submits credentials from [login.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/auth/login.js).
2. The request hits `POST /api/auth/login`.
3. `authRateLimit` evaluates the key and attempt count.
4. If under the limit, control passes to `login`.
5. If over the limit, the API returns `429` with a message.
6. The frontend shows that message in `#auth-message`.

## Current Password Change Flow
1. The dashboard profile form submits through [header-profile.js](/C:/Users/Jaswanth%20Uppu/Desktop/meeting_rooms_bookings/frontend/js/dashboard/shared/header/header-profile.js).
2. The request hits `POST /api/auth/change-password`.
3. `authRateLimit` runs before the password-change controller.
4. A `429` response is surfaced through `apiFetch`.
5. The frontend shows the returned message in the profile security message area.

## Frontend Behavior On 429
- Login uses direct `fetch` and displays the backend message.
- Dashboard password change uses `apiFetch`, which throws an error with the backend message.
- There is no automatic retry or client-side delay timer.
- The backend remains the source of truth for lockout timing.

## Operational Limitations
- The store is in memory only.
- Counts reset if the server restarts.
- Limits are per server instance, not shared across multiple instances.
- There is no persistent lockout audit table yet.

## Current Strengths
- protects the two most abuse-prone auth routes
- returns a user-visible message
- provides a `Retry-After` hint
- keeps the frontend thin by centralizing enforcement in middleware

## Conclusion
The rate-limit system is active and aligned with the current modular frontend. The stale references to `frontend/js/login.js` and `frontend/js/role-dashboard.js` have been replaced with the real current callers.
