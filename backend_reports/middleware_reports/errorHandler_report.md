# errorHandler.js End-to-End Report

## File Identity
- File path: `backend/src/middleware/errorHandler.js`.
- Middleware name: `errorHandler`.
- Purpose: central error response formatting and logging.
- Type: Express error-handling middleware.
- Signature: `(err, req, res, next)`.

## Why This Middleware Exists
- Converts thrown errors into consistent JSON responses.
- Prevents raw stack traces in production responses.
- Captures error context for operational logs.
- Ensures status codes are meaningful and stable.
- Reduces duplicate error handling in controllers.

## Where It Is Used In This Project
- Registered last in `backend/src/app.js`.
- Runs after `notFound` middleware.
- Receives errors from `asyncHandler` wrappers.
- Handles errors thrown in any route or middleware.
- Provides a single response contract for failures.

## Dependencies
- `logger` from `backend/src/utils/logger.js`.
- Reads `process.env.NODE_ENV` for dev mode.
- Reads `req.requestId` from `requestLogger`.
- Reads `req.method` and `req.originalUrl`.
- Uses `res.statusCode` if set earlier.

## Status Code Resolution
- `explicitStatus` reads `err.status` or `err.statusCode`.
- If `res.statusCode` is already set and not `200`, it wins.
- If an explicit status is a positive number, it is used next.
- Otherwise the default is `500`.
- This preserves upstream intent when present.

## Message Resolution
- For `status >= 500`, a generic safe message is used.
- Generic message: `"Something went wrong. Please try again later."`.
- For `status < 500`, uses `err.message` if available.
- If `err.message` is empty, uses `"Request failed."`.
- This keeps client-visible errors safe by default.

## Development Mode Behavior
- `isDev` is true when `NODE_ENV` is `development`.
- In dev, stack traces are included in logs.
- In dev, stack traces are included in the response body.
- In non-dev, stack traces are omitted everywhere.
- This balances debugging and security.

## Logging Behavior
- Logs at `logger.error` with event name `request_error`.
- Includes `request_id` if present on the request.
- Includes `status_code`, `method`, and `path`.
- Includes `error_message` derived from `err.message`.
- Includes `stack` only in development mode.

## Response Shape
- Always returns JSON.
- Fields include `message`.
- Includes `request_id` when available.
- Includes `stack` only in development.
- Uses the resolved `statusCode`.

## Input Conditions
- Any error passed to `next(err)`.
- Any error thrown in async handlers.
- Any middleware calling `next(err)` intentionally.
- Errors from invalid JSON parsing.
- Errors from database queries or controllers.

## Interaction With asyncHandler
- `asyncHandler` wraps async controllers.
- It catches promise rejections and forwards `err`.
- `errorHandler` then formats the response.
- This avoids unhandled promise rejections.
- The pattern keeps controllers clean.

## Interaction With requestLogger
- `requestLogger` attaches `req.requestId`.
- `errorHandler` includes the same ID in logs.
- Clients can report `request_id` for support.
- Logs can be correlated by `request_id`.
- If `requestLogger` is missing, `request_id` is undefined.

## Interaction With notFound
- `notFound` handles unknown routes with 404.
- `errorHandler` is still last but is not invoked for 404 unless `notFound` calls `next`.
- `notFound` ends the response; no error is thrown.
- For missing routes, `errorHandler` does not run.
- This keeps 404 responses simple and direct.

## Error Source Examples
- Invalid JWTs in `requireAuth` return 401 directly.
- Validation errors thrown in controllers reach `errorHandler`.
- Database errors from `query` can be thrown by controllers.
- CORS origin rejection can pass an error to Express.
- JSON parse errors trigger this handler automatically.

## Safe Response Policy
- Prevents exposing internal stack traces in production.
- Reduces accidental data leakage.
- Keeps client messaging consistent.
- Preserves user-friendly messages for 4xx errors.
- Allows detailed debugging in development.

## Error Object Expectations
- `err.message` should be a human-readable string.
- `err.status` or `err.statusCode` may be set by upstream code.
- Errors without status default to 500.
- Errors without message default to a generic message.
- Errors may include `stack` in V8 format.

## Path Resolution
- Uses `req.originalUrl` when present.
- Falls back to `req.url` if needed.
- This helps identify the failing endpoint.
- The path is included in logs only.
- The response does not include the path.

## Controller Usage Pattern
- Controllers can throw `Error` or `CustomError`.
- Controllers can set `err.status` for 4xx responses.
- Controllers can call `next(err)` directly.
- This middleware converts errors into JSON.
- No controller should send a response after throwing.

## Performance Notes
- Error handling runs only on failure paths.
- Logging is synchronous per `logger` implementation.
- Minimal computation is done in this handler.
- Uses a single object allocation for response.
- Safe to run even at high request volumes.

## Edge Cases
- If `res.statusCode` is accidentally set to 204, it may still win.
- If `err.status` is not numeric, it is ignored.
- If `req.requestId` is undefined, logs still emit.
- If response headers are already sent, Express may warn.
- If `err.stack` is missing, stack field is omitted.

## Failure Modes
- Incorrect `NODE_ENV` can leak stack traces.
- Missing logger configuration can reduce observability.
- If `res.statusCode` was set incorrectly, the wrong status is used.
- If downstream middleware already wrote to the response, error handling may be limited.
- If `logger.error` throws, Express may crash.

## Operational Guidance
- Keep `NODE_ENV=production` in production deployments.
- Review logs for `request_error` events regularly.
- Track the frequency of 500 errors as an SLO indicator.
- Correlate errors with request IDs for debugging.
- Use alerts on spikes in error rates.

## Testing Checklist
- Throw an error in a controller and verify 500 response.
- Set `err.status = 400` and verify 400 response.
- Verify `request_id` appears in error responses.
- Verify stack is included in dev but not prod.
- Verify CORS errors are formatted as JSON.

## Example Error Flow
- Controller calls `next(Object.assign(new Error("Bad input"), { status: 400 }))`.
- `errorHandler` resolves status to 400.
- `safeMessage` becomes `"Bad input"`.
- `logger.error` emits `request_error` log.
- Client receives `{ message: "Bad input", request_id: "..." }`.

## Example Server Error Flow
- Database query throws an exception.
- `asyncHandler` catches and calls `next(err)`.
- `errorHandler` resolves status to 500.
- Client receives a generic message.
- Stack is only returned in development.

## Integration Checklist
- Ensure `errorHandler` is the last middleware in `app.js`.
- Ensure `notFound` runs before `errorHandler`.
- Ensure `requestLogger` runs early for request IDs.
- Ensure controllers do not call `res.json` after throwing.
- Ensure custom errors set `status` when needed.

## Extension Ideas
- Add error codes for client-side handling.
- Add structured error types for validation.
- Add sanitization for known error objects.
- Add integration with an error tracking service.
- Add rate-limited logging for noisy errors.

## Maintenance Notes
- Keep this middleware small and predictable.
- Avoid embedding business logic in error handling.
- Ensure any changes preserve backward compatibility.
- Update docs if response shape changes.
- Review security implications when adding new fields.

## HTTP Semantics Notes
- 4xx errors indicate client-side problems.
- 5xx errors indicate server-side problems.
- The middleware enforces this distinction via `safeMessage`.
- Clients should not rely on stack traces for logic.
- Consistent JSON keeps API behavior predictable.

## Client Guidance
- Clients should surface `message` to end users when safe.
- Clients should log `request_id` for support.
- Clients should retry only on safe, idempotent requests.
- Clients should not retry on 4xx without changes.
- Clients should treat 401 and 403 distinctly in UI flows.

## Troubleshooting Tips
- Start with `request_id` in logs to trace the failure.
- Check `status_code` and `path` for scope.
- Inspect controller logs for validation errors.
- Validate that upstream middleware did not already send a response.
- Confirm `NODE_ENV` for expected stack behavior.

## Known Limitations
- Response format is fixed to `{ message, request_id, stack? }`.
- No localization or error translation is built-in.
- No structured error codes are provided.
- No automatic retry hints are added.
- Some errors may be masked by the generic 500 message.

## Compliance Notes
- Keep error messages free of personal data.
- Avoid including database query details in responses.
- Review stack exposure in non-production environments.
- Align error responses with API documentation.
- Ensure logs follow retention and access policies.
- Consider redacting secrets from error messages.
- Validate that error logs do not include credentials.
