# requireAuth.js End-to-End Report

## File Identity
- File path: `backend/src/middleware/requireAuth.js`.
- Middleware name: `requireAuth`.
- Purpose: authenticate requests using JWTs from cookies or headers.
- Type: Express middleware for protected routes.
- Scope: validates a single request and enriches `req.user`.

## Why This Middleware Exists
- Enforces authentication on protected endpoints.
- Centralizes JWT verification logic.
- Normalizes user data for controllers.
- Allows both cookie-based and bearer token auth.
- Prevents duplicated auth checks across routes.

## Where It Is Used In This Project
- Applied to `/api/auth/logout`, `/api/auth/me`, `/api/auth/change-password`.
- Applied to all `/api/employees` endpoints.
- Applied to all `/api/bookings` endpoints.
- Applied to `/api/rooms/:roomId/schedule`.
- Applied to all `/api/admin` endpoints together with `requireAdmin`.
- Registered inside route files like `auth.routes.js`, `booking.routes.js`, `admin.routes.js`.

## Dependencies
- `jsonwebtoken` for token verification.
- `authCookieName` from `backend/src/config/env.js`.
- `jwtSecret` from `backend/src/config/env.js`.
- Access to `req.headers.cookie` and `req.headers.authorization`.
- The middleware does not access the database.

## Auth Token Sources
- Cookie-based token stored in `authCookieName`.
- Bearer token from `Authorization: Bearer <token>`.
- Cookie token has priority over bearer token.
- If neither is found, request is rejected.
- This supports browser and API clients.

## Cookie Parsing Logic
- The raw cookie header is read from `req.headers.cookie`.
- The header is split on `;` into segments.
- Each segment is split on the first `=`.
- Cookie names are trimmed and normalized as-is.
- Cookie values are decoded with `decodeURIComponent`.
- Invalid percent-encoding falls back to raw value.
- Empty cookie header yields an empty object.

## Bearer Token Parsing Logic
- The authorization header is read as a string.
- Only headers starting with `Bearer ` are accepted.
- The token is the substring after the prefix.
- Extra whitespace is trimmed from the token.
- Any other scheme is ignored.

## Decision Order
- Parse cookies first.
- Extract cookie token for `authCookieName`.
- Extract bearer token if present.
- Use cookie token if non-empty.
- Fall back to bearer token if cookie is empty.

## JWT Verification
- `jwt.verify(token, jwtSecret)` is called.
- If verification fails, a 401 response is returned.
- If verification succeeds, payload fields are used.
- No additional signature checks are performed.
- Expired tokens are treated as invalid.

## User Context Shape
- `req.user.employee_id` is a number.
- `req.user.email` is copied from the token.
- `req.user.name` is copied from the token.
- `req.user.department` is copied from the token.
- `req.user.gender` is copied from the token.
- `req.user.is_admin` is normalized to boolean.
- `req.user.password_reset_required` is normalized to boolean.

## Boolean Normalization
- `toBoolean` accepts `true`, `1`, `"1"`, `"true"`.
- Any other value yields `false`.
- This keeps user flags consistent across routes.
- Token payload values are trusted as-is.
- There is no schema validation here.

## Responses On Failure
- Missing token results in status `401`.
- Missing token message: `"Authentication is required."`.
- Invalid or expired token results in status `401`.
- Invalid token message: `"Invalid or expired token."`.
- No `request_id` is included by this middleware.

## Responses On Success
- The middleware calls `next()` with no arguments.
- Downstream controllers rely on `req.user`.
- Response formatting is handled by the controller.
- No headers are modified by this middleware.
- No cookies are set or cleared here.

## Relation To Auth Controller
- Tokens are issued by `auth.controller.js`.
- `signAuthToken` signs tokens with `jwtSecret`.
- The cookie name matches `authCookieName`.
- The cookie is `httpOnly`, `sameSite`, `secure` per env.
- This middleware validates the same secret.

## Configuration Inputs
- `JWT_SECRET` is required and validated in `env.js`.
- `AUTH_COOKIE_NAME` controls the cookie lookup name.
- `JWT_EXPIRES_IN` controls token lifetime on creation.
- `NODE_ENV` influences cookie security in auth controller.
- All of these must be consistent across environments.

## Security Properties
- JWT signature validation is mandatory.
- Bearer tokens and cookies are both allowed.
- No refresh token logic is implemented.
- No token revocation list is implemented.
- Tokens remain valid until expiration.

## Trust Boundaries
- The token payload is trusted after verification.
- Controllers rely on `req.user` fields being accurate.
- Sensitive authorization decisions use `is_admin`.
- A forged token is prevented by JWT signature.
- Secret hygiene is critical to security.

## Error Handling
- All errors from `jwt.verify` are caught.
- The middleware does not throw errors outward.
- It always responds with `401` on auth failure.
- It does not include stack traces in responses.
- It does not call `next(err)` in failure cases.

## Interaction With Other Middleware
- Works after `requestLogger` and `securityHeaders`.
- Works after CORS and JSON parsing.
- In admin routes, `requireAdmin` runs after it.
- In booking routes, it protects all endpoints.
- It cooperates with `authRateLimit` on change-password.

## Observability
- The middleware does not log success or failure.
- Auth failures can be inferred from `401` responses.
- Request IDs are attached by `requestLogger`.
- Error logs are produced by `errorHandler` only if thrown.
- Consider adding audit logs if required.

## Performance Notes
- `jwt.verify` is computational but fast for HS256.
- Cookie parsing is O(n) in header length.
- No database I/O is done here.
- The middleware is lightweight overall.
- Using cookies avoids parsing JSON bodies here.

## Edge Cases
- A malformed cookie header yields empty cookies.
- A malformed bearer header yields no token.
- If both cookie and bearer tokens are present, cookie wins.
- If payload is missing fields, `req.user` has `undefined` fields.
- If `employee_id` is not numeric, it becomes `NaN`.

## Failure Modes
- Wrong `JWT_SECRET` breaks all authenticated routes.
- Token expiration breaks long-lived sessions.
- Token issued with missing fields can confuse controllers.
- If env validation fails, server fails to boot.
- If request is missing headers, auth fails as expected.

## Integration Checklist
- Confirm `requestLogger` runs before this middleware.
- Confirm `auth.routes.js` uses `requireAuth` on protected paths.
- Confirm admin routes also include `requireAdmin`.
- Confirm frontend sends cookies on same-site requests.
- Confirm API clients send `Authorization: Bearer`.

## Testing Checklist
- Call a protected route without token and expect 401.
- Call with invalid token and expect 401.
- Call with expired token and expect 401.
- Call with valid cookie token and expect 200 from controller.
- Call with valid bearer token and expect 200 from controller.

## Example Request Flow
- Client logs in and receives auth cookie.
- Client calls `/api/bookings/upcoming` with cookie.
- `requireAuth` reads cookie and verifies JWT.
- `req.user` is attached for controller access.
- Controller executes normally and returns data.

## Example Bearer Flow
- Client obtains token from login response.
- Client calls `/api/admin/employees` with `Authorization` header.
- `requireAuth` extracts bearer token.
- JWT verifies against `jwtSecret`.
- `req.user` indicates admin status for `requireAdmin`.

## Hardening Suggestions
- Add token issuer and audience checks.
- Add a token version field to allow revocation.
- Add structured logs for auth failures.
- Add rate limits on protected routes when needed.
- Consider rotating JWT secrets with a key ID.

## Maintenance Notes
- This middleware is small and easy to audit.
- Changes should be reviewed for security impact.
- Coordinate with frontend on cookie name changes.
- Keep env validation aligned with auth controllers.
- Add tests for header parsing edge cases.

## Cookie Vs Bearer Tradeoffs
- Cookies are convenient for browser sessions.
- Bearer tokens are convenient for API clients.
- Cookies can be protected with `httpOnly`.
- Bearer tokens require client-side storage decisions.
- Cookies are sent automatically with same-site requests.
- Bearer tokens require explicit header handling.

## Frontend Integration Notes
- Frontend should send credentials for cookie-based auth.
- Frontend should handle `401` by redirecting to login.
- API clients should include `Authorization: Bearer` when needed.
- Avoid mixing cookie and bearer tokens in the same request.
- Ensure auth cookie name matches `AUTH_COOKIE_NAME`.
- Ensure local dev origins are allowed by CORS.

## Data Handling Responsibilities
- `requireAuth` only verifies the token signature.
- Controllers must enforce role checks when needed.
- Controllers should handle `password_reset_required`.
- Controllers should validate `employee_id` from `req.user`.
- The admin route uses `requireAdmin` after this middleware.
- The booking routes depend on `req.user` for ownership checks.
