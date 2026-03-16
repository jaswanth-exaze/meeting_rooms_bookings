# notFound.js End-to-End Report

#3 File Identity
- File path: `backend/src/middleware/notFound.js`.
- Middleware name: `notFound`.
- Purpose: return a consistent 404 JSON response.
- Type: Express middleware for unmatched routes.
- Signature: `(req, res, next)`.

## Why This Middleware Exists
- Ensures unknown routes return a JSON response.
- Prevents generic HTML 404 pages from Express.
- Provides a stable error message for the frontend.
- Captures the path that was requested.
- Keeps routing failures consistent across the API.

## Where It Is Used In This Project
- Registered near the end of `backend/src/app.js`.
- Runs after all API routes are registered.
- Runs before the global `errorHandler`.
- Applies to all HTTP methods.
- Handles both `/api/*` and `/frontend/*` paths when unmatched.

## Dependencies
- No external libraries are used.
- Uses Express `req` and `res` objects.
- Reads `req.originalUrl`.
- Uses `res.status(404)` and `res.json`.
- Does not use any environment configuration.

## Core Behavior
- Always sets status code `404`.
- Always responds with JSON.
- Response contains a `message` string.
- Response includes the `path` that was requested.
- The middleware terminates the request.

## Response Shape
- `message` is `"Route not found"`.
- `path` is `req.originalUrl`.
- No `request_id` is included here.
- No error codes or metadata are included.
- Body format is consistent across all 404s.

## Interaction With Routing
- If a route matches, this middleware is skipped.
- If no route matches, it runs once.
- It does not call `next()`.
- It does not throw an error.
- It provides a graceful default response.

## Relation To errorHandler
- `notFound` does not forward to `errorHandler`.
- `errorHandler` is for runtime errors, not missing routes.
- 404 responses are returned directly here.
- This keeps 404s lightweight and predictable.
- If needed, you can change it to call `next(err)`.

## Interaction With requestLogger
- `requestLogger` runs earlier and assigns `requestId`.
- `notFound` does not use or echo the request ID.
- The 404 response is still logged by `requestLogger` on finish.
- Logs include status code and path.
- Correlation still works via logs, not response body.

## Expected Inputs
- Any request that does not match a route.
- Any HTTP method including GET, POST, PATCH, DELETE.
- Any URL path, including invalid or misspelled routes.
- Requests with or without query parameters.
- Requests with or without headers.

## Observability
- 404s are visible via access logs.
- `requestLogger` records `status_code: 404`.
- `path` is captured in the log event.
- There is no dedicated 404 log event here.
- You can add logging if tracking is required.

## Security Considerations
- Does not leak internal route structure.
- Returns a generic message.
- Does not include stack traces.
- Prevents default Express HTML error pages.
- Minimal information exposure for attackers.

## API Consistency
- All API responses are JSON in this project.
- 404 responses follow the same JSON style.
- Frontend can parse `message` and `path` consistently.
- Avoids content-type mismatches.
- Simplifies client error handling.

## Path Handling
- Uses `req.originalUrl` for the path field.
- Includes query string if present.
- Reflects the exact URL requested by the client.
- Does not sanitize or normalize the path.
- This is suitable for debugging and client feedback.

## Order Of Registration
- It must appear after all route registrations.
- It must appear before `errorHandler`.
- It must appear after static file middleware.
- In `app.js`, it appears after all `/api/*` routes.
- If moved earlier, it could shadow valid routes.

## Performance Notes
- The middleware is constant-time.
- It allocates a small JSON object.
- It does not access the database.
- It is only executed on unmatched routes.
- Negligible overhead on normal traffic.

## Edge Cases
- If `req.originalUrl` is missing, `path` is undefined.
- If `res.headersSent` is already true, Express may warn.
- If another middleware ended the response, it is not invoked.
- If `express.static` served a file, this is skipped.
- If a route throws, `errorHandler` runs instead.

## Failure Modes
- A missing 404 handler could return HTML.
- A missing handler could return a 404 with no body.
- If the handler is misordered, valid routes might 404.
- If `res.status` is overwritten by upstream code, status might change.
- If JSON serialization fails, Express will throw.

## Example Client Impact
- Frontend calls `/api/rooms/unknown` and gets 404.
- The client shows "Route not found".
- Debugging uses the `path` field for clarity.
- Logging shows the same path and 404 status.
- No sensitive details are leaked.

## Testing Checklist
- Request an unknown API path and expect 404 JSON.
- Request with query string and verify `path` includes it.
- Verify response content-type is JSON.
- Verify `message` text is stable.
- Verify `errorHandler` is not invoked for 404.

## Integration Checklist
- Confirm this is after all routers in `app.js`.
- Confirm `errorHandler` is registered after it.
- Confirm `express.static` is registered before it.
- Confirm the health route is registered before it.
- Confirm logging still occurs for 404s.

## Extension Ideas
- Add a `request_id` field to the response.
- Add a `timestamp` field for client debugging.
- Add a standardized `code` field like `ROUTE_NOT_FOUND`.
- Provide a link to API docs in the response.
- Add a counter metric for 404s.

## Maintenance Notes
- Keep the response format backward compatible.
- Ensure any new fields are documented.
- Avoid exposing internal routing details.
- Keep the middleware simple and deterministic.
- Update tests if response shape changes.

## Design Tradeoffs
- Simple JSON body keeps client parsing easy.
- No structured error codes limits machine handling.
- Not including request ID keeps payload small.
- Returning 404 rather than throwing avoids error logs.
- The current design is low risk and stable.

## Operational Guidance
- Monitor 404 rates to detect broken links.
- High 404 rates can indicate frontend routing issues.
- For API consumers, publish valid endpoint docs.
- Consider adding SLOs for unexpected 404 spikes.
- Use logs to identify top missing routes.

## Frontend Routing Considerations
- SPA routes should be served by the frontend build, not the API.
- If frontend routes are missing, 404s will surface here.
- Keep `/frontend` static mapping aligned with deployment structure.
- Ensure client-side routing does not conflict with `/api` paths.
- Prefer a dedicated frontend server for complex SPAs.

## Static Asset Considerations
- `express.static` serves files before this middleware.
- Missing static files will fall through to 404 JSON.
- For browser clients, JSON 404s can look odd for assets.
- Consider a separate static 404 for assets if needed.
- Keep asset URLs stable to avoid broken references.

## API Versioning Notes
- If API versioning is added, update this handler messaging.
- Consider returning `code: ROUTE_NOT_FOUND` for machine parsing.
- For deprecated endpoints, prefer explicit 410 responses.
- Route deprecation should be logged separately from 404s.
- Maintain docs for all supported API versions.

## Security Review Notes
- Do not expose internal routing tables in responses.
- Avoid echoing request headers or query strings.
- Keep the message generic and non-sensitive.
- Keep the response stable to avoid fingerprinting.
- Avoid reflecting user input beyond the path.

## Runbook Steps
- Verify the requested path in routing files.
- Check `app.js` for route registration order.
- Check for typos in client URL construction.
- Check environment-specific base URLs.
- Check CORS errors that may look like 404s in clients.

## Example Requests
- `GET /api/does-not-exist` returns 404 JSON.
- `POST /api/rooms/9999/unknown` returns 404 JSON.
- `GET /frontend/missing.js` returns 404 JSON.
- `GET /api/rooms` does not invoke this handler.
- `GET /api/health` does not invoke this handler.

## Metrics And Alerts
- Track 404 rate by endpoint path.
- Track top 10 missing routes per day.
- Track 404s by user agent to find bot traffic.
- Track 404s for static asset paths separately.
- Alert on sudden spikes after deployments.

## Localization And UX Notes
- The message is fixed to English.
- Clients should translate or map the message if needed.
- Consistent text helps with analytics and filtering.
- If localization is required, add a `code` field.
- Avoid exposing internal routes in localized text.
- Keep UX messages short and clear for end users.
- Update API docs if the message text changes.
