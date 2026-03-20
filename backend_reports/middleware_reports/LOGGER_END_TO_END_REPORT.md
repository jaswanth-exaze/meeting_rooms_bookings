# Logger End-to-End Usage Report

This report documents how `backend/src/utils/logger.js` is implemented, why it exists, and how it is used across the backend.
It is based on the current code in the `backend/src` folder.

## Scope

- Code location: `backend/src/utils/logger.js`.
- Consumers: middleware, controllers, and server bootstrap.
- Output: JSON lines to stdout or stderr.
- Configuration: `LOG_LEVEL` and `NODE_ENV`.

## Executive Summary

- The logger is a small wrapper around `console.log` and `console.error`.
- It emits structured JSON for consistent ingestion and parsing.
- It supports four levels: `error`, `warn`, `info`, and `debug`.
- Default level is `debug` in development and `info` in production.
- It is used for request logging, error logging, server lifecycle events, and key booking events.

## Why We Use This Logger

- Consistent structure across all logs.
- Easy to parse by log aggregators.
- Zero external dependencies.
- Low overhead and simple configuration.
- Compatible with container logs and standard output collection.

## Logger Implementation Details

- File: `backend/src/utils/logger.js`.
- Imports `nodeEnv` from `backend/src/config/env.js`.
- Defines severity levels as numeric ranks.
- Filters messages based on the configured log level.
- Serializes logs as JSON in a single line.

## Log Levels and Severity Mapping

- `error` has severity `0`.
- `warn` has severity `1`.
- `info` has severity `2`.
- `debug` has severity `3`.
- Lower number means higher severity.

## Log Level Configuration

- `LOG_LEVEL` is read from `process.env.LOG_LEVEL`.
- If not set, default is `debug` in non-production.
- If not set, default is `info` in production.
- If `LOG_LEVEL` is invalid, it falls back to `info`.
- Levels are matched case-insensitively after trim and lowercase.

## Level Filtering Behavior

- `error` logs always show unless `LOG_LEVEL` is invalid.
- `warn` logs show when `LOG_LEVEL` is `warn`, `info`, or `debug`.
- `info` logs show when `LOG_LEVEL` is `info` or `debug`.
- `debug` logs show only when `LOG_LEVEL` is `debug`.
- Filtering is handled by `shouldLog(level)`.

## Metadata Handling

- Metadata is only accepted if it is an object.
- Arrays are rejected and converted to an empty object.
- Non-objects are ignored.
- Metadata fields are shallow-merged into the log payload.

## Log Payload Shape

- `ts` is an ISO 8601 timestamp.
- `level` is one of `error`, `warn`, `info`, `debug`.
- `message` is a short event name or summary string.
- Additional fields are from metadata.

## Output Streams

- `error` logs go to `console.error`.
- All other logs go to `console.log`.
- This helps separate error streams in log collectors.

## Example Log Line

- Example (info):
  `{"ts":"2026-03-16T06:12:34.123Z","level":"info","message":"server_started","port":4000}`
- Example (error):
  `{"ts":"2026-03-16T06:12:40.987Z","level":"error","message":"request_error","status_code":500,"path":"/api/rooms"}`

## Public API

- `logger.error(message, meta)`.
- `logger.warn(message, meta)`.
- `logger.info(message, meta)`.
- `logger.debug(message, meta)`.

## Runtime Initialization

- Logger evaluates `LOG_LEVEL` on module load.
- The configured level does not change at runtime.
- Any change to `LOG_LEVEL` requires a process restart.

## Where Logger Is Used (File Map)

- `backend/src/middleware/requestLogger.js`.
- `backend/src/middleware/errorHandler.js`.
- `backend/src/app.js`.
- `backend/src/server.js`.
- `backend/src/controllers/booking.controller.js`.

## Request Logger Usage

- File: `backend/src/middleware/requestLogger.js`.
- Event name: `http_request`.
- Severity: `info`.
- Logs once per response on `finish`.
- Captures request timing in milliseconds.
- Creates or forwards `X-Request-Id`.
- Records `method`, `path`, `status_code`, `duration_ms`, and `ip`.

## Request Logger Flow

- On request start, a timer is started.
- The request is given a `request_id`.
- The `X-Request-Id` header is set on the response.
- After response completes, a log is emitted.

## Error Handler Usage

- File: `backend/src/middleware/errorHandler.js`.
- Event name: `request_error`.
- Severity: `error`.
- Logs include request context and error message.
- Stack traces are included only in development mode.

## Error Handler Fields

- `request_id` correlates errors to `http_request` logs.
- `status_code` is derived from response or error.
- `method` and `path` identify the endpoint.
- `error_message` is always present.
- `stack` is only included in development.

## CORS Block Logging

- File: `backend/src/app.js`.
- Event name: `cors_blocked`.
- Severity: `warn`.
- Triggered when request origin is not allowed.
- Includes `origin` in metadata.

## Server Lifecycle Logging

- File: `backend/src/server.js`.
- Event name: `server_started`.
- Severity: `info`.
- Includes `port` value.
- Logged after DB connectivity check succeeds.

## Server Startup Failure Logging

- File: `backend/src/server.js`.
- Event name: `server_start_failed`.
- Severity: `error`.
- Includes a friendly message and the error message.
- Triggered if initial DB connectivity check fails.

## Unhandled Rejection Logging

- File: `backend/src/server.js`.
- Event name: `unhandled_rejection`.
- Severity: `error`.
- Captures the rejection reason message.

## Uncaught Exception Logging

- File: `backend/src/server.js`.
- Event name: `uncaught_exception`.
- Severity: `error`.
- Captures error message and stack trace.
- The process exits after logging.

## Booking Creation Logging

- File: `backend/src/controllers/booking.controller.js`.
- Event name: `booking_created`.
- Severity: `info`.
- Emitted after booking insert and audit.
- Includes booking id, organizer id, actor id, room id, and counts.

## Booking Participant Update Logging

- File: `backend/src/controllers/booking.controller.js`.
- Event name: `booking_participants_updated`.
- Severity: `info`.
- Emitted after participant sync and audit.
- Includes booking id, actor id, added ids, removed ids, and counts.

## Log Event Catalog

- `http_request` for request telemetry.
- `request_error` for errors thrown in handlers.
- `cors_blocked` for rejected CORS origins.
- `server_started` for healthy startup.
- `server_start_failed` for startup DB failure.
- `unhandled_rejection` for Promise rejections.
- `uncaught_exception` for fatal exceptions.
- `booking_created` for successful booking insert.
- `booking_participants_updated` for participant changes.

## End-to-End Request Flow With Logs

- Request enters Express.
- `requestLogger` sets `request_id` and starts timer.
- Route logic runs.
- If route throws, `errorHandler` logs `request_error`.
- When response finishes, `http_request` is logged.

## Correlation Strategy

- `request_id` links request logs and errors.
- `request_id` is echoed in response headers.
- Clients can send `X-Request-Id` to preserve tracing.
- Booking logs can be correlated by `booking_id`.

## How to Change Log Level

- Set `LOG_LEVEL=debug` for verbose logs.
- Set `LOG_LEVEL=info` for standard logs.
- Set `LOG_LEVEL=warn` to suppress info logs.
- Set `LOG_LEVEL=error` for only errors.
- Restart the server to apply the change.

## Local Development Recommendations

- Use `LOG_LEVEL=debug` for troubleshooting.
- Watch stdout for JSON log lines.
- Filter by `message` to find relevant events.

## Production Recommendations

- Use `LOG_LEVEL=info` or `warn`.
- Keep `error` logs enabled.
- Forward stdout and stderr to a log collector.
- Preserve JSON formatting for parsers.

## Security Considerations

- Do not log raw passwords or tokens.
- Avoid logging request bodies with credentials.
- Be careful with personally identifiable information.
- Keep error messages safe for production users.

## Privacy Considerations

- `ip` is logged in request telemetry.
- Ensure retention policies follow privacy standards.
- Consider masking IP addresses if required by policy.

## Reliability Considerations

- Logger is synchronous and writes to console.
- High log volume can slow the process.
- Use appropriate log levels for noisy routes.

## Performance Considerations

- Each log event uses `JSON.stringify`.
- Avoid logging large objects in metadata.
- Request logging runs on every request.

## Usage Examples

- In a controller:
  `logger.info("booking_created", { booking_id, room_id })`
- In middleware:
  `logger.error("request_error", { request_id, path, status_code })`
- For warnings:
  `logger.warn("cors_blocked", { origin })`

## Adding New Log Events

- Choose an event name in snake_case.
- Pick the lowest log level that makes sense.
- Include request_id if in a request context.
- Include primary entity ids for tracing.
- Avoid adding PII unless necessary.

## Consistency Guidelines

- Keep `message` short and stable.
- Use metadata fields for details.
- Prefer numeric ids over derived names.
- Do not change event names without reason.

## Testing Considerations

- Unit tests do not currently assert logs.
- Manual verification can use `LOG_LEVEL=debug`.
- You can grep log output by event name.

## Known Gaps

- No log rotation or file output.
- No built-in sampling for high-volume routes.
- No structured metrics export.
- No centralized correlation id beyond `request_id`.

## Suggested Improvements

- Add `LOG_LEVEL` to `.env.example` for visibility.
- Add `logger.debug` usage for key trace points.
- Add `logger.warn` for suspicious business events.
- Add a `service` or `app` field in log payloads.
- Add optional `env` field in log payloads.

## Logger Design Rationale

- Keeping the logger simple reduces dependency risk.
- JSON format aligns with cloud log collection.
- Numeric levels allow efficient filtering.
- Metadata merging is fast and predictable.

## Risk Assessment

- If `LOG_LEVEL` is set incorrectly, logs may be missing.
- If stdout is not captured, logs are lost.
- If metadata is not an object, it is ignored silently.

## Operational Playbook

- Check `server_started` after deploy.
- Check `server_start_failed` for DB issues.
- Check `request_error` for 5xx spikes.
- Check `cors_blocked` if frontends are blocked.
- Check `booking_created` to confirm booking flow.

## Troubleshooting Checklist

- Confirm `LOG_LEVEL` is valid.
- Confirm node process has access to stdout/stderr.
- Confirm `request_id` is present in responses.
- Confirm errors reach `errorHandler`.
- Confirm JSON logs are not being truncated.

## Log Field Reference

- `ts` is an ISO timestamp.
- `level` is the severity.
- `message` is the event name.
- `request_id` correlates a request.
- `path` is the request path.
- `method` is the HTTP method.
- `status_code` is the HTTP status.
- `duration_ms` is request duration.
- `ip` is the client IP.
- `error_message` is the error detail.
- `stack` is present only in development.
- `origin` is the blocked CORS origin.
- `booking_id` is the booking primary key.
- `room_id` is the meeting room primary key.
- `organizer_employee_id` is the booking organizer id.
- `actor_employee_id` is the user performing an action.
- `participant_count` is attendee count.

## Relationship to Other Modules

- `env.js` provides `nodeEnv` for defaults.
- `requestLogger` uses `logger.info` for request logs.
- `errorHandler` uses `logger.error` for request errors.
- `server.js` uses `logger.info` and `logger.error` for lifecycle.
- `booking.controller.js` uses `logger.info` for booking events.

## End-to-End Example: Successful Login

- User logs in.
- `requestLogger` logs `http_request`.
- No explicit logger call in login on success.
- Any errors would be logged by `errorHandler`.

## End-to-End Example: CORS Block

- Browser sends request from unapproved origin.
- CORS middleware denies the origin.
- `logger.warn("cors_blocked", { origin })` is emitted.
- Client receives a 403 error.

## End-to-End Example: Booking Creation

- User submits booking.
- Validation passes and transaction starts.
- Booking inserted and audit recorded.
- `logger.info("booking_created", ...)` is emitted.
- Client receives 201 response.

## End-to-End Example: Server Startup Failure

- Server attempts DB health check.
- DB connection fails.
- `logger.error("server_start_failed", ...)` is emitted.
- Process exits with code 1.

## End-to-End Example: Unhandled Rejection

- A Promise rejects outside a try/catch.
- `process.on("unhandledRejection")` logs it.
- This helps detect missing error handling.

## End-to-End Example: Uncaught Exception

- A synchronous error escapes handlers.
- `process.on("uncaughtException")` logs it.
- Process exits to avoid undefined state.

## Summary

- The logger provides structured JSON logs with minimal complexity.
- It is used consistently for key operational events.
- It can be extended without changing existing interfaces.

## File References

- `backend/src/utils/logger.js`
- `backend/src/middleware/requestLogger.js`
- `backend/src/middleware/errorHandler.js`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/controllers/booking.controller.js`
