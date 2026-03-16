# Express End-to-End in This Project

This document explains how Express is used in the backend, how requests flow through middleware and routes, and why Express is the framework of choice for this project.

## Scope
- Runtime: Node.js backend.
- Framework: Express.
- Entry point: `backend/src/server.js`.
- App definition: `backend/src/app.js`.

## Why We Use Express
- Minimal, flexible HTTP framework for Node.js.
- Clear middleware model for cross-cutting concerns.
- Easy routing for REST APIs.
- Large ecosystem of middleware.

## Where Express Is Used
- `backend/src/app.js` builds the Express application.
- `backend/src/server.js` starts the HTTP server.
- `backend/src/routes/*.routes.js` define route handlers.
- `backend/src/middleware/*` defines custom middleware.

## Server Startup Flow
1. `server.js` imports the Express app.
2. A DB health check runs with `query("SELECT 1")`.
3. On success, `app.listen(port)` starts the server.
4. On failure, a structured log is emitted and the process exits.

## Middleware Chain (Order Matters)
The middleware order in `app.js` is:
1. `requestLogger` assigns request IDs and logs timing.
2. `securityHeaders` sets common security headers.
3. `cors` evaluates allowed origins and credentials.
4. `express.json` parses JSON bodies with a 1mb limit.
5. `express.static` serves frontend files under `/frontend`.
6. Route handlers for API endpoints.
7. `notFound` handles unmatched routes.
8. `errorHandler` returns structured error responses.

## Middleware Responsibilities
- `requestLogger` adds `X-Request-Id` and measures duration.
- `securityHeaders` hardens responses with security headers.
- `cors` allows or blocks cross-origin browser requests.
- `express.json` ensures request bodies are parsed safely.
- `express.static` serves UI assets for demo usage.
- `notFound` produces a consistent 404 response.
- `errorHandler` formats errors and logs them.

## Request Logger Details
- Generates or accepts `X-Request-Id`.
- Logs method, path, status, duration, and IP.
- Writes logs with the `logger` utility.

## Security Headers Middleware
- Adds `X-Content-Type-Options: nosniff`.
- Adds `X-Frame-Options: DENY`.
- Adds `Referrer-Policy: strict-origin-when-cross-origin`.
- Adds `Permissions-Policy` to restrict camera, microphone, geolocation.
- Adds `Cross-Origin-Resource-Policy: same-site`.
- Adds `Strict-Transport-Security` in production.

## JSON Body Parsing
- `express.json({ limit: "1mb" })` is configured.
- Requests with larger JSON payloads are rejected.
- This protects the server from oversized payloads.

## Static File Serving
- The frontend is served under `/frontend`.
- Static path is `frontend/` at repo root.
- This is helpful for local testing and demos.

## Route Layout
Routes are organized by domain:
- `auth.routes.js` handles login, logout, and password change.
- `employee.routes.js` handles employee profile data.
- `location.routes.js` handles office locations.
- `room.routes.js` handles room listings and schedules.
- `booking.routes.js` handles booking operations.
- `admin.routes.js` handles admin-only endpoints.

## Endpoint Map (High-Level)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `GET /api/locations`
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `GET /api/rooms/:roomId/schedule`
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `GET /api/admin/metrics`
- `GET /api/admin/reports`

## Auth Integration with Express
- `requireAuth` middleware protects authenticated routes.
- `requireAdmin` enforces admin role for admin endpoints.
- `authRateLimit` protects login and password routes.

## Example Route Flow
1. Client sends `POST /api/auth/login`.
2. CORS validates the origin and credentials.
3. JSON body is parsed.
4. Rate limiter allows or blocks the request.
5. Controller verifies credentials and sets auth cookie.
6. Response is returned to the client.

## Error Handling Flow
1. Any error in a route calls `next(err)` or throws.
2. `errorHandler` builds a safe message.
3. In development, stack traces are included.
4. In production, stack traces are omitted.
5. Response includes a `request_id` for tracing.

## Error Response Shape
Example:
```json
{
  "message": "Something went wrong. Please try again later.",
  "request_id": "9c81c3b0-58c4-4a5e-8f8f-7c9a2b6d1f4a"
}
```

## Response Conventions
- JSON is the default response format for API routes.
- Successful responses include domain-specific data.
- Error responses include a safe `message`.
- Error responses include a `request_id` for tracing.
- 401 indicates missing or invalid authentication.
- 403 indicates insufficient authorization.
- 404 indicates an unknown route.
- 500 indicates an unexpected server failure.

## Sample Requests
```bash
curl -i http://localhost:4000/api/health
```

```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"TempPass@123\"}"
```

## Admin Route Gating
- Admin routes always require `requireAuth`.
- Admin routes then require `requireAdmin`.
- Non-admin users receive 403.
- Admin access is defined by `req.user.is_admin`.

## Health Endpoint Notes
- `GET /api/health` is unauthenticated.
- It returns `{ "status": "ok" }`.
- It is used for basic uptime checks.

## Static Asset Notes
- Static assets are served from the `frontend` directory.
- Static routes do not require authentication.
- Static assets are useful for local demos.

## Not Found Behavior
- `notFound` returns `404` with JSON.
- The response includes the requested path.

## Request Lifecycle Summary
1. Incoming request hits Express app.
2. Middleware stack runs in order.
3. Route handler matches path and method.
4. Controller logic runs and returns JSON.
5. Response is sent and logged.

## Environment Settings That Affect Express
- `PORT` controls the listen port.
- `NODE_ENV` controls security header behavior.
- `CORS_ORIGIN` affects CORS decisions.

## Observability
- Every request gets a unique ID.
- Logs include status, timing, and path.
- Errors are logged with context.

## Logging Fields
- `request_id` for tracing across logs.
- `method` and `path` for request identity.
- `status_code` for outcome.
- `duration_ms` for performance.
- `ip` for source tracking.

## Local Development Notes
- Use `npm run dev` to start with nodemon.
- Server listens on port 4000 by default.
- API base URL is `/api`.
- Static UI is served under `/frontend`.

## Testing and Validation
- Use `curl` to test endpoints.
- Use `node --test` for unit tests.
- Test error paths to confirm `errorHandler` output.

## Troubleshooting Checklist
- Confirm server is running and listening on `PORT`.
- Confirm DB connectivity to avoid startup exit.
- Check CORS origin and credentials when browser requests fail.
- Verify JSON payloads are under 1mb.
- Ensure required middleware is registered before routes.
- Check logs for request IDs and error details.
- Confirm `notFound` is below all routes.
- Confirm `errorHandler` is the last middleware.
- Confirm router prefixes match the frontend API calls.


## Production Readiness Notes
- Use HTTPS so Secure cookies are sent.
- Enable `AUTH_COOKIE_SECURE=true` in production.
- Ensure `NODE_ENV=production` for HSTS.
- Monitor request latency and error rates.

## Release Checklist
- Run a health check on `/api/health`.
- Smoke test login and `GET /api/auth/me`.
- Verify admin endpoints require admin role.
- Verify CORS allows the deployed frontend origin.
- Verify error responses include `request_id`.
- Verify request logging is present in logs.
- Verify static assets serve under `/frontend`.
- Monitor CPU and memory after deployment.

## Implementation Checklist
- Keep middleware ordering explicit and documented.
- Apply `requireAuth` to every protected router.
- Use `notFound` and `errorHandler` at the end.
- Avoid large JSON payloads.
- Avoid blocking the event loop in controllers.
- Keep response shapes consistent across endpoints.
- Keep request logging enabled in all environments.
- Use a single API base prefix (`/api`) consistently.
- Document any new middleware added to the stack.

## Glossary
- Middleware: A function that runs before the route handler.
- Router: A sub-application that groups routes.
- Handler: The function that processes a request.
- Request ID: A unique identifier for tracing.
- HSTS: HTTP Strict Transport Security header.

## File References
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/employee.routes.js`
- `backend/src/routes/location.routes.js`
- `backend/src/routes/room.routes.js`
- `backend/src/routes/booking.routes.js`
- `backend/src/routes/admin.routes.js`
- `backend/src/middleware/requestLogger.js`
- `backend/src/middleware/securityHeaders.js`
- `backend/src/middleware/notFound.js`
- `backend/src/middleware/errorHandler.js`
- `backend/package.json`
