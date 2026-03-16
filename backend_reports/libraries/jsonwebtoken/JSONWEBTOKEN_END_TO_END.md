# JSON Web Token End-to-End in This Project

This document explains how the `jsonwebtoken` library is used in this repository, why it is used, and how tokens move through the system.
It is project-specific and maps to the actual backend code paths.

## Scope
- Runtime: Node.js backend.
- Library: `jsonwebtoken` for signing and verifying JWTs.
- Transport: HttpOnly cookie or Authorization header.
- Storage: Token is not stored in the database.

## Why We Use jsonwebtoken
- Stateless authentication for API requests.
- Short-lived session tokens.
- Easy to verify across routes without DB lookups.
- Works with HttpOnly cookies for browser clients.

## Where It Is Used
- `backend/src/controllers/auth.controller.js` signs tokens during login and password change.
- `backend/src/middleware/requireAuth.js` verifies tokens on protected routes.
- `backend/src/config/env.js` loads `JWT_SECRET` and `JWT_EXPIRES_IN`.
- `backend/src/routes/auth.routes.js` wires login, logout, and change-password.
- `backend/src/routes/admin.routes.js` uses `requireAuth` before `requireAdmin`.
- `backend/src/routes/employee.routes.js` enforces `requireAuth`.
- `backend/src/routes/booking.routes.js` enforces `requireAuth`.
- `backend/src/routes/room.routes.js` uses `requireAuth` on schedule routes.

## Dependency Details
- Dependency is defined in `backend/package.json` as `jsonwebtoken`.
- The library is used directly via `jwt.sign` and `jwt.verify`.
- No custom wrapper is used beyond local helper functions.

## Environment Configuration
These variables control JWT behavior:
- `JWT_SECRET` is required and must be at least 32 characters.
- `JWT_EXPIRES_IN` controls token lifetime, default is `2h`.
- `AUTH_COOKIE_NAME` sets the cookie name used for auth.
- `AUTH_COOKIE_SECURE` controls Secure cookies in production.
- `AUTH_COOKIE_SAME_SITE` controls SameSite cookie behavior.
- `AUTH_COOKIE_MAX_AGE` sets cookie lifetime in ms or duration format.
- `NODE_ENV` controls production behavior for cookies.

## Token Issuance Flow (Login)
1. User posts credentials to `POST /api/auth/login`.
2. The password is verified via bcrypt logic.
3. The server builds the employee payload.
4. The server signs the payload with `jwt.sign`.
5. The token is sent as an HttpOnly cookie.
6. The response includes the employee object.

## Token Issuance Flow (Change Password)
1. User calls `POST /api/auth/change-password` with current and new password.
2. Server verifies current password and validates new password.
3. Server hashes the new password and updates the DB.
4. Server signs a new JWT with updated `password_reset_required`.
5. A new auth cookie is set in the response.

## Token Payload Contents
The token contains a subset of employee fields:
- `employee_id`
- `email`
- `name`
- `department`
- `gender`
- `is_admin`
- `password_reset_required`

## Cookie Details
Cookie options are assembled in `auth.controller.js`:
- `httpOnly` is always true.
- `sameSite` is derived from `AUTH_COOKIE_SAME_SITE`.
- `secure` is derived from `AUTH_COOKIE_SECURE`.
- `maxAge` uses `AUTH_COOKIE_MAX_AGE` or `JWT_EXPIRES_IN`.
- `path` is `/` to apply across the API.

## Token Verification Flow
1. `requireAuth` checks for a cookie named `AUTH_COOKIE_NAME`.
2. If no cookie is present, it checks the `Authorization` header.
3. If a Bearer token is found, it is verified with `jwt.verify`.
4. On success, `req.user` is populated from the payload.
5. On failure, a 401 response is returned.

## Protected Route Behavior
The following patterns are used:
- `router.use(requireAuth)` protects an entire router.
- `requireAdmin` checks `req.user.is_admin` after JWT verification.
- Missing or invalid tokens always return 401.

## Error Responses and Messages
These are the primary JWT-related responses:
- `Authentication is required.` when no token is found.
- `Invalid or expired token.` when verification fails.
- `Admin access is required.` when authorization fails after auth.

## Why Cookies Are Used
- HttpOnly cookies are not accessible to JavaScript.
- Cookies work well with browser sessions.
- The server can rotate or clear cookies easily.

## When Authorization Headers Are Used
- Non-browser clients can send `Authorization: Bearer <token>`.
- The middleware supports either cookie or header.
- Header tokens are optional and are not required for browsers.

## End-to-End Trace (Happy Path)
1. Client logs in with email and password.
2. Server authenticates and sets the JWT cookie.
3. Client calls `/api/auth/me` with cookies.
4. `requireAuth` verifies JWT and sets `req.user`.
5. Route handler responds with the employee profile.

## End-to-End Trace (Expired Token)
1. Client calls a protected endpoint with an expired cookie.
2. `jwt.verify` throws an error.
3. The middleware returns 401 with `Invalid or expired token.`
4. Client must re-authenticate.

## CORS and Cookies Interaction
- CORS is configured with `credentials: true`.
- The frontend must send `credentials: "include"`.
- The origin must be allowed by the CORS policy.

## Security Decisions in This Project
- Tokens are short-lived via `JWT_EXPIRES_IN`.
- Cookies are HttpOnly to reduce XSS exposure.
- Secrets are validated and rejected if weak.
- Tokens are not stored in localStorage.

## Rotation and Key Management
- Changing `JWT_SECRET` invalidates existing tokens.
- Rotate secrets during planned maintenance.
- Update `JWT_SECRET` in all environments at the same time.
- Consider shortening expiration during a rotation window.

## Local Development Notes
- Default CORS origins include common localhost ports.
- `AUTH_COOKIE_SECURE` can be false in development.
- `AUTH_COOKIE_SAME_SITE` defaults to `lax`.
- Always set a strong `JWT_SECRET` locally.

## Observability
- Login and auth errors are handled in route controllers.
- `requireAuth` returns 401 without logging by default.
- Consider adding auth metrics around 401 rates if needed.

## Testing and Validation
Manual login test:
```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"TempPass@123\"}"
```

Check a protected endpoint:
```bash
curl -i http://localhost:4000/api/auth/me --cookie "mrb_auth=<token>"
```

## Troubleshooting Checklist
- Confirm `JWT_SECRET` is set and meets length requirements.
- Confirm `JWT_EXPIRES_IN` is valid (example: `2h`).
- Confirm the cookie name matches `AUTH_COOKIE_NAME`.
- Confirm the client sends cookies with `credentials: "include"`.
- Confirm system time is correct to avoid expiry skew.
- Confirm the `Authorization` header uses `Bearer ` prefix.
- Confirm CORS allows the frontend origin.
- Confirm a login response sets the cookie.
- Confirm `requireAuth` is applied to the expected routes.
- Confirm `requireAdmin` is only used after `requireAuth`.

## Common Misconfigurations
- `JWT_SECRET` left as a placeholder value.
- `AUTH_COOKIE_SAME_SITE=none` with `AUTH_COOKIE_SECURE=false`.
- Missing `credentials: "include"` on frontend fetch calls.
- Using a token from a different environment.

## Operational Notes
- JWTs are stateless and cannot be revoked individually.
- Logging out clears the cookie but does not revoke the token.
- Shorter expiration reduces risk from token leakage.

## Implementation Checklist
- Decide the fields included in the JWT payload.
- Avoid storing sensitive data in JWT payload.
- Keep `JWT_SECRET` out of version control.
- Keep tokens short-lived and refresh via re-login.
- Ensure clock sync on server instances.
- Use `requireAuth` on all protected routes.
- Use `requireAdmin` only where admin is required.
- Provide a clear 401 response for invalid tokens.
- Use HttpOnly cookies for browser usage.
- Support Authorization headers for non-browser clients.

## Route Matrix and Auth Expectations
- `POST /api/auth/login` issues a new JWT cookie.
- `POST /api/auth/logout` clears the JWT cookie.
- `GET /api/auth/me` requires a valid JWT.
- `POST /api/auth/change-password` requires a valid JWT.
- `/api/employees/*` requires a valid JWT.
- `/api/bookings/*` requires a valid JWT.
- `/api/admin/*` requires a valid JWT and admin role.
- `/api/rooms/:roomId/schedule` requires a valid JWT.
- `/api/locations/*` requires a valid JWT when configured in routes.
- `GET /api/health` does not require JWT.

## Operational Playbook
- When 401 rates spike, check JWT secret consistency across instances.
- When logins succeed but protected routes fail, check cookie domain and path.
- When tokens expire too quickly, verify `JWT_EXPIRES_IN` format.
- When cookies are not set, verify `AUTH_COOKIE_SECURE` and HTTPS usage.
- When tokens are rejected after deployment, verify server clock drift.
- When cross-origin requests fail, verify CORS `credentials` and allowed origins.
- When switching environments, clear cookies to avoid stale tokens.
- When rotating JWT secrets, announce a forced re-login window.
- When debugging, log token presence but never log token values.

## FAQ
Q: Why is the JWT not stored in the database?
A: This project uses stateless tokens to avoid session storage.

Q: Can the frontend read the JWT?
A: Not when it is stored in an HttpOnly cookie.

Q: Why is `password_reset_required` in the token?
A: It allows the UI to prompt a password change immediately.

Q: Why support Authorization headers?
A: It allows API usage from non-browser clients.

Q: What happens if the token is missing?
A: `requireAuth` returns a 401 response.

## Glossary
- JWT: JSON Web Token, a signed JSON payload.
- JWS: JSON Web Signature, the signing mechanism used by JWT.
- Claim: A key-value pair in a JWT payload.
- Subject: The identity represented by the token.
- Issuer: The system that issues the token.
- Audience: The intended recipient of the token.
- Expiration: The time after which a token is invalid.
- Issued At: The timestamp when a token is created.
- Not Before: The time before which a token is invalid.
- Bearer Token: A token presented in the Authorization header.
- Cookie: A browser-managed storage mechanism.

## File References
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requireAuth.js`
- `backend/src/config/env.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/admin.routes.js`
- `backend/src/routes/employee.routes.js`
- `backend/src/routes/booking.routes.js`
- `backend/src/routes/room.routes.js`
- `backend/package.json`
