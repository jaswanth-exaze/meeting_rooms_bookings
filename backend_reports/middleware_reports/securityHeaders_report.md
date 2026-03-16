# securityHeaders.js End-to-End Report

## File Identity
- File path: `backend/src/middleware/securityHeaders.js`.
- Middleware name: `securityHeaders`.
- Purpose: add baseline HTTP security headers.
- Type: Express middleware.

## Why This Middleware Exists
- Reduce common browser-based attack vectors.
- Standardize security headers across responses.
- Apply HSTS in production.
- Provide secure defaults without extra libraries.

## Dependencies
- `isProduction` from `backend/src/config/env.js`.
- No external packages.

## Where It Is Used
- Registered in `backend/src/app.js`.
- Runs after `requestLogger`.
- Runs before CORS and routes.

## Headers Set By This Middleware
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- `Cross-Origin-Resource-Policy: same-site`.
- `Strict-Transport-Security` in production only.

## Header Purpose Summary
- `X-Content-Type-Options` prevents MIME sniffing.
- `X-Frame-Options` prevents clickjacking.
- `Referrer-Policy` controls referrer leakage.
- `Permissions-Policy` denies sensitive APIs by default.
- `Cross-Origin-Resource-Policy` restricts resource sharing.
- `HSTS` enforces HTTPS in browsers.

## HSTS Behavior
- Added only when `isProduction` is true.
- Uses `max-age=31536000; includeSubDomains`.
- Instructs browsers to use HTTPS for 1 year.

## Execution Flow
- Middleware runs for every request.
- Sets headers unconditionally.
- Calls `next()` immediately.
- Does not block or modify response body.

## End-to-End Example
- Client requests `/api/health`.
- Middleware injects headers.
- Response includes security headers.
- Browser applies security policies.

## Request Scope
- Applies to API responses.
- Applies to static file responses.
- Applies to error responses.
- Applies to redirects.

## Interaction With Other Middleware
- Does not depend on auth or body parsing.
- Runs before CORS decisions.
- Runs before `notFound` and `errorHandler`.
- Does not inspect request headers.

## Default Values
- Values are hardcoded in the middleware.
- No dynamic configuration per request.

## Security Rationale
- Headers are a low-cost defense layer.
- Prevents embedding via iframes.
- Limits browser feature access.
- Reduces referrer data leakage.

## Cross-Origin Considerations
- `Cross-Origin-Resource-Policy: same-site` restricts usage.
- Combined with CORS allowlist for API calls.
- Helps prevent cross-site data exfiltration.

## Known Limitations
- No Content-Security-Policy header.
- No `X-Content-Security-Policy` legacy header.
- No `X-XSS-Protection` header (deprecated).
- Does not set `Cross-Origin-Opener-Policy`.
- Does not set `Cross-Origin-Embedder-Policy`.

## Where It Is Defined In Code
- In `securityHeaders(_req, res, next)`.
- Headers are set via `res.setHeader`.
- Production check gates HSTS only.

## Error Handling
- No try/catch; nothing thrown.
- If header setting fails, Express will error downstream.
- There is no internal logging.

## Performance Considerations
- Constant time per request.
- Minimal string allocations.
- Negligible overhead.

## Privacy Considerations
- `Referrer-Policy` reduces information shared.
- No sensitive data logged.
- No request data stored.

## Operational Considerations
- HSTS can affect local testing if misconfigured.
- HSTS should only be enabled for HTTPS domains.
- Ensure production domain supports HTTPS.

## Configuration Notes
- `isProduction` comes from `NODE_ENV`.
- `NODE_ENV=production` triggers HSTS.
- All other headers are always set.

## Testing Ideas
- Call `/api/health` and inspect headers.
- Verify HSTS is present in production.
- Verify HSTS is absent in development.
- Verify `X-Frame-Options` is `DENY`.
- Verify `Permissions-Policy` denies listed features.

## Edge Cases
- Responses with custom headers still receive these.
- Error responses still receive these.
- Static assets receive these.
- Redirect responses receive these.

## Compatibility Notes
- `Permissions-Policy` is supported by modern browsers.
- Some headers are ignored by older browsers.
- `X-Frame-Options` remains widely supported.

## Detailed Step Breakdown
- Step 1: Middleware is invoked.
- Step 2: Set `X-Content-Type-Options`.
- Step 3: Set `X-Frame-Options`.
- Step 4: Set `Referrer-Policy`.
- Step 5: Set `Permissions-Policy`.
- Step 6: Set `Cross-Origin-Resource-Policy`.
- Step 7: If production, set `Strict-Transport-Security`.
- Step 8: Call `next()`.

## Header Reference Details
- `X-Content-Type-Options: nosniff` stops MIME-type sniffing.
- `X-Frame-Options: DENY` blocks framing entirely.
- `Referrer-Policy: strict-origin-when-cross-origin` limits referrer data.
- `Permissions-Policy` denies camera, microphone, geolocation.
- `Cross-Origin-Resource-Policy: same-site` blocks cross-site usage.
- `Strict-Transport-Security` enforces HTTPS.

## FAQ
- Q: Why not use helmet?
- A: This middleware provides a minimal subset without dependencies.
- Q: Can I add CSP here?
- A: Yes, but CSP needs careful tuning.
- Q: Does this break embedded iframes?
- A: Yes, `DENY` prevents framing.
- Q: Why only HSTS in production?
- A: HSTS should not be enabled for HTTP dev environments.
- Q: Does it affect API clients?
- A: Most clients ignore these headers.
- Q: Is `Permissions-Policy` mandatory?
- A: It is optional but adds a protection layer.
- Q: Does it prevent XSS?
- A: Not by itself; CSP is needed for that.
- Q: Does it prevent CSRF?
- A: No, CSRF requires other measures.
- Q: Does it block CORS?
- A: No, CORS is handled separately.
- Q: Can I override headers per route?
- A: Yes, if you set headers after this middleware.

## Extended Checklist
- Verify headers appear in API responses.
- Verify headers appear in static responses.
- Verify HSTS only in production.
- Verify no header typos.
- Verify values match expected strings.
- Verify `Referrer-Policy` is correct.
- Verify `Permissions-Policy` matches desired features.
- Verify `Cross-Origin-Resource-Policy` is appropriate.
- Verify frame protection aligns with UI needs.
- Verify security headers do not break integrations.

## Suggested Improvements
- Add `Content-Security-Policy` for XSS mitigation.
- Add `Cross-Origin-Opener-Policy` for isolation.
- Add `Cross-Origin-Embedder-Policy` if needed.
- Add `X-Permitted-Cross-Domain-Policies` for legacy.
- Make some headers configurable per environment.

## Summary
- Adds consistent security headers to responses.
- Keeps defaults simple and safe.
- Enhances protection without external dependencies.

## Headers Not Set Here
- `Content-Security-Policy` is not configured in this middleware.
- `X-XSS-Protection` is not configured (modern browsers ignore it).
- `Expect-CT` is not configured.
- `Cross-Origin-Opener-Policy` is not configured.
- `Cross-Origin-Embedder-Policy` is not configured.

## HSTS Deployment Notes
- HSTS is only enabled when `isProduction` is true.
- `isProduction` is derived from `NODE_ENV` in `env.js`.
- The header value includes `max-age=31536000`.
- The value includes `includeSubDomains`.
- HSTS should only be enabled over HTTPS.

## CORS Interaction Notes
- These headers are independent of the CORS middleware.
- CORS decisions still occur in `app.js` before routes.
- `Cross-Origin-Resource-Policy` is enforced by browsers.
- This middleware does not set `Access-Control-*` headers.
- Security headers are applied on both success and error responses.

## Operational Guidance
- Keep header values consistent across environments.
- Review headers after major browser changes.
- Consider adding CSP for stronger XSS protection.
- Update documentation if header values change.
- Monitor security scans for missing headers.

## Client Impact Notes
- Browsers enforce these headers automatically.
- Most non-browser API clients ignore these headers.
- If a UI is embedded in an iframe, `DENY` will block it.
- If you need embedding, consider `SAMEORIGIN` or CSP `frame-ancestors`.
- If the frontend needs referrers, update `Referrer-Policy` carefully.
- Permissions-Policy may block device APIs in web clients.

## File References
- `backend/src/middleware/securityHeaders.js`
- `backend/src/app.js`
- `backend/src/config/env.js`
