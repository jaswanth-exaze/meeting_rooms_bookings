# requestLogger.js End-to-End Report

## File Identity
- File path: `backend/src/middleware/requestLogger.js`.
- Middleware name: `requestLogger`.
- Purpose: request-level telemetry and correlation IDs.
- Type: Express middleware (runs before routes).

## Why This Middleware Exists
- Creates a request correlation ID.
- Attaches the ID to requests and responses.
- Measures request duration.
- Emits structured logs for every request.
- Enables tracing across logs and responses.

## Dependencies
- `crypto` for `randomUUID`.
- `logger` from `backend/src/utils/logger.js`.
- `process.hrtime.bigint` for timing.

## Where It Is Used
- Registered early in `backend/src/app.js`.
- Runs before security headers and CORS.
- Runs for all API and static file requests.

## Entry Conditions
- Executes on every inbound HTTP request.
- Does not depend on authentication.
- Does not read request body.

## Output Behavior
- Sets `X-Request-Id` header in the response.
- Attaches `requestId` to `req`.
- Writes a log line on response finish.

## Request ID Handling
- Reads `x-request-id` from request headers.
- Uses it if present and non-empty.
- Generates `crypto.randomUUID()` otherwise.
- Ensures a stable ID per request.

## Timing Logic
- Captures `start` using `process.hrtime.bigint()`.
- Calculates `durationMs` on `res.finish`.
- Converts nanoseconds to milliseconds.
- Rounds to 2 decimal places.

## Logging Event
- Logs via `logger.info`.
- Event name: `http_request`.
- Emits one log per request.

## Logged Fields
- `request_id`.
- `method`.
- `path`.
- `status_code`.
- `duration_ms`.
- `ip`.

## Path Resolution
- Uses `req.originalUrl` if available.
- Falls back to `req.url`.
- Keeps the raw path without modification.

## IP Resolution
- Uses `req.ip`.
- Relies on Express `trust proxy` settings.
- Defaults to Express behavior if not configured.

## Lifecycle Flow
- Middleware runs at the start of the chain.
- Adds `requestId` to `req`.
- Adds `X-Request-Id` to `res`.
- Registers a listener on `res.finish`.
- Continues to next middleware with `next()`.
- Logs after the response is sent.

## End-to-End Example
- Client sends `GET /api/rooms`.
- `requestLogger` attaches `request_id`.
- Response completes with status 200.
- `logger.info` emits `http_request`.
- Client receives `X-Request-Id`.

## Error Handling
- This middleware does not catch errors.
- Errors are handled by downstream middleware.
- The log still emits after error responses.

## Interaction With errorHandler
- `errorHandler` logs `request_error`.
- `requestLogger` logs `http_request`.
- Both share the same `request_id`.
- This enables correlation of failures.

## Interaction With securityHeaders
- Runs before `securityHeaders`.
- Does not modify security headers.

## Interaction With CORS
- Runs before CORS decisions.
- Logs requests even when CORS blocks.

## Interaction With Static Files
- Runs for `/frontend` static requests.
- Logs static asset requests like any API call.

## Performance Considerations
- Constant work per request.
- Uses a single timer per request.
- Minimal allocation beyond request ID and log payload.
- Logging volume scales with request rate.

## Reliability Considerations
- If logging fails, it does not throw.
- It uses `logger.info`, which uses console output.
- Console output is synchronous in Node by default.

## Security Considerations
- Does not log request bodies.
- Does not log headers except request id.
- Logs IP address, which is PII in some contexts.
- Ensure retention policies match privacy requirements.

## Configuration Notes
- No explicit configuration in this middleware.
- Depends on logger log level.
- Depends on Express trust proxy settings for IP.

## Field Dictionary
- `request_id`: unique request correlation id.
- `method`: HTTP verb.
- `path`: requested URL path.
- `status_code`: HTTP status code.
- `duration_ms`: request latency in milliseconds.
- `ip`: client IP as seen by Express.

## Error Scenarios and Outcomes
- Missing `x-request-id` header: new UUID is generated.
- Invalid `x-request-id` header: still used as provided.
- Response never finishes: no log is emitted.
- Logger log level filters out info: no request log is emitted.

## Testing Ideas
- Send a request and verify `X-Request-Id` header.
- Send multiple requests and ensure unique IDs.
- Supply `X-Request-Id` and ensure it is preserved.
- Verify duration is non-negative.
- Verify path matches `originalUrl`.

## Operational Guidelines
- Use `request_id` to trace requests in logs.
- Combine `request_error` and `http_request` lines.
- Monitor latency by aggregating `duration_ms`.
- Monitor throughput by counting `http_request` events.

## Implementation Checklist
- Ensure `requestLogger` is registered before routes.
- Ensure `X-Request-Id` is not overwritten by downstream code.
- Ensure `logger.info` is enabled at the desired level.

## Improvement Opportunities
- Add user ID in logs after auth, if desired.
- Add response size to logs for performance analysis.
- Add request payload size for monitoring.
- Add sampling for high-volume environments.

## Detailed Step Breakdown
- Step 1: Middleware is invoked for every request.
- Step 2: Read `x-request-id` header if present.
- Step 3: Generate UUID if header missing.
- Step 4: Store ID on `req.requestId`.
- Step 5: Set `X-Request-Id` on response.
- Step 6: Start high-resolution timer.
- Step 7: Register `res.finish` handler.
- Step 8: Let request flow continue.
- Step 9: Response finishes with status code.
- Step 10: Stop timer and compute duration.
- Step 11: Build log payload fields.
- Step 12: Emit `http_request` log line.
- Step 13: Log includes `status_code` for outcome.
- Step 14: Log includes `duration_ms` for latency.
- Step 15: Log includes `ip` for source tracking.
- Step 16: Log includes `path` for route.
- Step 17: Log includes `method` for HTTP verb.
- Step 18: Log includes `request_id` for correlation.
- Step 19: Downstream errors still trigger a finish log.
- Step 20: If log level filters info, log is skipped.

## FAQ
- Q: Does this middleware log request bodies?
- A: No, it only logs metadata fields.
- Q: Can clients supply their own request ID?
- A: Yes, via `X-Request-Id`.
- Q: What happens if `X-Request-Id` is invalid?
- A: It is still used as-is.
- Q: Is the log line emitted before response?
- A: No, it is emitted after response finishes.
- Q: Can the timing be negative?
- A: No, timing is derived from monotonic clock.
- Q: Is the UUID generation expensive?
- A: It is minimal and acceptable per request.
- Q: Does it run for static files?
- A: Yes, it runs for all requests.
- Q: Does it depend on authentication?
- A: No, it runs before auth.
- Q: Can it be disabled?
- A: Only by removing it from `app.js`.
- Q: How is duration rounded?
- A: It is rounded to two decimals.
- Q: Does it log response size?
- A: Not currently.
- Q: Is the log output structured?
- A: Yes, JSON is emitted.
- Q: Is the request ID in response?
- A: Yes, `X-Request-Id`.
- Q: Can it be used for tracing?
- A: Yes, with correlation IDs.
- Q: Can it be sampled?
- A: Not currently, but can be extended.

## Glossary
- Request ID: unique identifier for a request.
- Correlation: linking logs by a shared id.
- Finish event: emitted when response completes.
- Latency: time between request start and finish.
- Telemetry: operational data about requests.

## Extended Checklist
- Verify `X-Request-Id` appears in responses.
- Verify `http_request` logs are emitted.
- Verify log JSON parses correctly.
- Verify `duration_ms` is present.
- Verify `status_code` reflects response.
- Verify `path` matches route.
- Verify `method` matches HTTP verb.
- Verify `ip` is expected for proxy setups.
- Verify log level includes `info`.
- Verify `request_id` matches error logs.

## Summary
- This middleware adds request correlation and timing.
- It provides a consistent log format for every request.
- It is essential for operational visibility.

## File References
- `backend/src/middleware/requestLogger.js`
- `backend/src/utils/logger.js`
