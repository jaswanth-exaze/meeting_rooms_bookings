# CORS From Basics to Internal Mechanics

This document explains what CORS is, why it exists, and how browsers and servers handle it internally.

## Same-Origin Policy
Browsers enforce the same-origin policy, which prevents a webpage from reading responses from a different origin. An origin is the combination of scheme, host, and port. Example: `https://app.example.com:443` is a different origin than `http://app.example.com:80` or `https://api.example.com:443`.

### Origin Details
- Scheme matters: `http` and `https` are different origins.
- Port matters: `https://app.example.com:443` differs from `https://app.example.com:8443`.
- Host matters: `https://api.example.com` differs from `https://app.example.com`.
- Paths do not matter: `https://app.example.com/a` and `https://app.example.com/b` are the same origin.

### Origin vs Site
Browsers also use the concept of "site" (roughly the eTLD+1), which matters for cookies and SameSite rules. CORS is based on origin, not site. Two subdomains on the same site are still different origins.

## What CORS Does
CORS is a protocol that lets a server explicitly allow a browser to read responses from a different origin. The browser still enforces the rules; the server only provides permission signals through HTTP headers.

Important distinction:
- CORS controls whether JavaScript can read a response.
- CORS does not prevent the request from being sent.

Some cross-origin requests will still reach the server, but the browser will hide the response from JavaScript if CORS checks fail.

## How CORS Works Internally
The browser decides how to proceed based on the request type:

### Simple Request Flow
Simple requests are `GET`, `HEAD`, or `POST` with only safe headers and one of these content types: `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`.

Steps:
1. Browser sends the request with an `Origin` header.
2. Server responds with `Access-Control-Allow-Origin` if the origin is allowed.
3. Browser checks the header and either exposes the response to JavaScript or blocks it.

### Preflight Request Flow
Non-simple requests require a preflight.

Steps:
1. Browser sends an `OPTIONS` request with `Origin`, `Access-Control-Request-Method`, and optionally `Access-Control-Request-Headers`.
2. Server responds with `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and optionally `Access-Control-Allow-Headers`.
3. If allowed, the browser sends the actual request.
4. The response is checked again against the CORS headers.

## What Triggers a Preflight
A preflight happens when a request is not "simple." Common triggers:
- Methods other than `GET`, `HEAD`, or `POST` (for example, `PUT`, `PATCH`, `DELETE`).
- Custom request headers (for example, `Authorization`, `X-Request-Id`).
- Content types outside the simple list (for example, `application/json`).

## Request and Response Headers in CORS
Request headers:
- `Origin`: identifies the calling origin.
- `Access-Control-Request-Method`: the actual method the browser intends to use (preflight only).
- `Access-Control-Request-Headers`: requested custom headers (preflight only).

Response headers:
- `Access-Control-Allow-Origin`: which origin is allowed. It must be an exact origin or `*`.
- `Access-Control-Allow-Methods`: which methods are allowed for this origin.
- `Access-Control-Allow-Headers`: which request headers are allowed.
- `Access-Control-Allow-Credentials`: whether cookies and auth are allowed.
- `Access-Control-Expose-Headers`: which response headers JavaScript can read.
- `Access-Control-Max-Age`: how long a preflight can be cached.

## Credentials and Cookies
When a request includes credentials (cookies, HTTP auth, or client certificates):
- The server must return `Access-Control-Allow-Credentials: true`.
- The server must return a specific origin in `Access-Control-Allow-Origin`, not `*`.
- The frontend must opt in by sending credentials.

## Null Origin
Some contexts send `Origin: null`, for example:
- Requests from `file://` URLs.
- Sandboxed iframes without `allow-same-origin`.
- Certain redirects or opaque origins.

If you allow `null`, you are allowing these contexts. Treat it as a separate origin and only allow it when you specifically want to support those cases.

## CORS Header Summary
- `Origin`: sent by the browser to identify the caller's origin.
- `Access-Control-Allow-Origin`: tells the browser which origin is allowed.
- `Access-Control-Allow-Methods`: lists allowed HTTP methods for preflight.
- `Access-Control-Allow-Headers`: lists allowed request headers for preflight.
- `Access-Control-Allow-Credentials`: allows credentials to be included.
- `Access-Control-Expose-Headers`: tells the browser which response headers JavaScript can read.
- `Access-Control-Max-Age`: how long the preflight can be cached.

## Example: Simple Request
Request:
```http
GET /api/health HTTP/1.1
Origin: http://localhost:3000
```

Response:
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Vary: Origin
```

## Example: Preflight + Actual Request
Preflight request:
```http
OPTIONS /api/bookings HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

Preflight response:
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
Vary: Origin
```

Actual request:
```http
POST /api/bookings HTTP/1.1
Origin: http://localhost:3000
Content-Type: application/json
Authorization: Bearer <token>
```

## CORS and Fetch Modes
When you use `fetch` in the browser:
- `mode: "cors"` is the default for cross-origin requests and applies CORS rules.
- `mode: "no-cors"` sends the request but returns an opaque response that JavaScript cannot read.
- `mode: "same-origin"` blocks cross-origin requests entirely.

## CORS vs CSRF
- CORS controls whether JavaScript can read a cross-origin response.
- CSRF is about sending authenticated requests without user intent.

CORS is not a CSRF defense. Use SameSite cookies, CSRF tokens, or double-submit cookies when needed.

## Caching and Vary
If your server dynamically sets `Access-Control-Allow-Origin` based on the request:
- Include `Vary: Origin` in the response to avoid cache poisoning.
- Preflight responses can be cached with `Access-Control-Max-Age`.

## Common Failure Patterns
- Returning `Access-Control-Allow-Origin: *` while also using credentials.
- Forgetting to include `Access-Control-Allow-Headers` for custom headers.
- Allowing the wrong scheme or port (origin must match exactly).
- Omitting `Vary: Origin` when responding with dynamic origins.
- Letting preflight requests hit auth middleware that blocks `OPTIONS`.

## Security Notes
- Do not blindly reflect `Origin` without validating it.
- Keep the allowed origin list as small as practical.
- CORS only affects browsers, so server-to-server calls are not blocked.

## Important Internal Notes
- CORS is enforced by browsers, not by servers.
- Non-browser clients (curl, server-to-server calls) are not blocked by CORS.
- The server should send `Vary: Origin` when responses depend on the request origin.
- A response can be successful on the network but still be blocked by the browser if CORS headers are missing or incorrect.
