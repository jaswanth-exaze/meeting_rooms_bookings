# authRateLimit.js End-to-End Report

## File Identity
- File path: `backend/src/middleware/authRateLimit.js`.
- Middleware name: `authRateLimit`.
- Purpose: throttle authentication-related requests to reduce abuse.
- Type: Express middleware.
- Scope: in-memory, per-process rate limiting.

## Why This Middleware Exists
- Protects the login endpoint from brute-force attempts.
- Slows down repeated password change attempts.
- Provides a simple, dependency-free throttling layer.
- Reduces load on the database and auth controllers.
- Adds a user-facing retry signal for rate limited clients.

## Where It Is Used In This Project
- Applied on `POST /api/auth/login`.
- Applied on `POST /api/auth/change-password`.
- Registered in `backend/src/routes/auth.routes.js`.
- Runs after JSON body parsing from `app.js`.
- Runs before the auth controllers execute.

## Dependencies
- No external libraries are required.
- Uses `Date.now()` for time tracking.
- Uses a `Map` to store per-key counters.
- Reads `req.ip` and `req.body` for key generation.
- Uses response headers for `Retry-After`.

## Core Constants
- `WINDOW_MS` is `15 * 60 * 1000` (15 minutes).
- `MAX_ATTEMPTS` is `10`.
- `STORE_MAX_SIZE` is `10000`.
- These values are hard-coded in the file.
- There is no runtime configuration for these values.

## Data Structure
- The `store` is a `Map` keyed by string.
- Each entry is an object with `count` and `resetAt`.
- `count` is an integer of attempts in the window.
- `resetAt` is a timestamp in milliseconds.
- The map is shared across all requests in the process.

## Key Generation
- The key is derived from IP and optional email.
- `req.ip` is used when present.
- `req.connection.remoteAddress` is used as a fallback.
- The email is taken from `req.body.email`.
- Email is trimmed and lowercased.
- If email is empty, the key is only the IP.
- If email exists, the key is `ip:email`.
- This keeps separate counters per IP and email combo.

## Cleanup Strategy
- Cleanup runs on every request.
- Cleanup only runs when `store.size >= STORE_MAX_SIZE`.
- Each entry with `resetAt <= now` is removed.
- Cleanup does not shrink active entries.
- Cleanup is time-based, not LRU-based.
- Cleanup is best-effort and synchronous.

## Request Flow Summary
- The middleware records `now = Date.now()`.
- It calls `cleanup(now)` before any logic.
- It builds a key using `buildKey(req)`.
- It reads an existing entry from the `store`.
- It decides between reset, increment, or block.

## First Attempt Or Expired Entry
- A missing entry is treated as a new window.
- An expired entry is replaced with a new window.
- The new entry has `count: 1`.
- The new entry has `resetAt: now + WINDOW_MS`.
- The request is allowed immediately.

## Incrementing Within The Window
- The existing entry is retrieved from the map.
- `existing.count` is incremented.
- The updated entry is written back to the map.
- The window end time remains unchanged.
- The updated count is then evaluated.

## Blocking Behavior
- When `count > MAX_ATTEMPTS`, the request is blocked.
- A `Retry-After` header is set on the response.
- `Retry-After` is computed in seconds.
- The header is at least `1` second.
- Status code `429` is returned.
- The JSON response contains a friendly message.

## Success Behavior
- If `count <= MAX_ATTEMPTS`, the request continues.
- The middleware calls `next()` with no arguments.
- Downstream handlers run as normal.
- No additional headers are set on success.
- No response body is written on success.

## Error Handling
- The middleware does not throw explicit errors.
- All control flow is synchronous.
- Invalid or missing IP falls back to `"unknown"`.
- Missing email results in IP-only keying.
- Unexpected `req.body` shapes are tolerated.

## Interaction With JSON Parsing
- The middleware expects `req.body.email` for keying.
- `express.json()` runs before this middleware in `app.js`.
- For login and change-password routes, JSON body is present.
- If body parsing fails earlier, error handler takes over.
- If request has no body, only IP is used.

## Interaction With Authentication
- Runs before `login` and `changePassword` controllers.
- Protects the auth logic from repetitive attempts.
- Works independently of `requireAuth` for login.
- On `change-password`, it runs after `requireAuth`.
- This means authenticated users can also be throttled.

## Response Contract
- Success path does not change status codes.
- Block path always uses status `429`.
- Block path response body uses `message` only.
- No error codes or error IDs are included.
- Retry guidance uses the `Retry-After` header.

## Observability
- This middleware does not log by itself.
- Use `requestLogger` and downstream logs for visibility.
- Throttled responses can be identified by status `429`.
- Retry intervals can be observed from response headers.
- Add logging here if abuse patterns need tracking.

## Security Considerations
- Limits brute force and credential stuffing by IP and email.
- Helps reduce account lockout attacks.
- Uses in-memory state so attackers can reset by restarting.
- Does not protect against distributed IP attacks.
- Does not validate email format for keying.

## Performance Notes
- The `Map` lookup is O(1) average.
- The cleanup loop is O(n) when it runs.
- Cleanup only runs when map size hits 10000 entries.
- The middleware is lightweight for normal usage.
- The rate limiter is per-process and fast.

## Scaling Considerations
- Each server instance has its own `store`.
- Horizontal scaling splits rate limits by instance.
- Load balancers can weaken effective throttling.
- Sticky sessions can make rate limits more consistent.
- For multi-instance setups, use a shared store.

## Configuration Notes
- All thresholds are constants in the file.
- To tune behavior, edit `WINDOW_MS`, `MAX_ATTEMPTS`.
- To tune memory, edit `STORE_MAX_SIZE`.
- No environment variable overrides are implemented.
- Consider wiring `env.js` if dynamic config is needed.

## Edge Cases
- If `req.ip` is missing, key uses `"unknown"`.
- If `req.headers` are spoofed, IP may be inaccurate.
- If email is missing, many users share the IP bucket.
- If a user rotates IPs, counts spread across buckets.
- If `store` grows too large, cleanup may be slower.

## Failure Modes
- On process restart, all counters reset.
- If time skews, windows might be shortened or extended.
- If `Date.now()` is mocked, behavior changes.
- If `req.body` is not parsed, email is not used.
- If `STORE_MAX_SIZE` is reached, cleanup latency increases.

## Security Headers And CORS Interactions
- This middleware is independent of security headers.
- It executes after `requestLogger` and `securityHeaders`.
- It executes after CORS in the normal pipeline.
- It does not set any CORS headers by itself.
- It relies on standard Express response handling.

## Testing Checklist
- Verify `429` after 11th attempt within 15 minutes.
- Verify success resets after 15 minutes.
- Verify `Retry-After` is set on blocked responses.
- Verify email-based keying for repeated login attempts.
- Verify IP-only keying when email is absent.
- Verify change-password throttling behaves the same.

## Example Timeline
- Attempt 1 at `t=0` creates a new window.
- Attempt 2 at `t=10s` increments to 2.
- Attempt 10 at `t=120s` is allowed.
- Attempt 11 at `t=130s` returns `429`.
- Attempt 12 at `t=140s` returns `429`.

## Example Key Derivation
- Request IP: `203.0.113.10`.
- Email: `User@Example.com`.
- Normalized email: `user@example.com`.
- Key produced: `203.0.113.10:user@example.com`.
- If email missing, key is just `203.0.113.10`.

## Why It Is Safe To Run Early
- It does not rely on database connections.
- It does not mutate request body.
- It does not create side effects on success.
- It can short-circuit abusive traffic quickly.
- It reduces work for downstream handlers.

## Tradeoffs
- Simple and dependency-free implementation.
- No distributed coordination across instances.
- No burst control beyond simple counts.
- No per-route customization.
- No user-level exemptions or allowlists.

## Extension Ideas
- Add per-route configuration for window and max.
- Persist counters in Redis or another shared store.
- Add allowlist for internal IP ranges.
- Add metrics for blocked attempts.
- Add a small jitter to avoid synchronized retries.

## Maintenance Notes
- The middleware is pure JavaScript with no I/O.
- Changes are low-risk and easy to review.
- Any change affects security behavior directly.
- Use tests to validate before changing thresholds.
- Document changes in security review notes.

## Metrics To Monitor
- Track the count of `429` responses on auth routes.
- Track unique IPs hitting the limiter per hour.
- Track unique email keys hitting the limiter per hour.
- Track average `Retry-After` values returned.
- Track login success rate during spikes.
- Track change-password failures during spikes.

## Runbook Notes
- If a legitimate user is blocked, wait for the window to reset.
- If abuse is sustained, reduce `MAX_ATTEMPTS` temporarily.
- If false positives are high, increase `MAX_ATTEMPTS` or `WINDOW_MS`.
- If memory grows, reduce `STORE_MAX_SIZE` or add persistent store.
- If multiple nodes are deployed, consider shared rate limits.
