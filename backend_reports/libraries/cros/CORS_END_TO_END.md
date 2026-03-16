# CORS End-to-End in This Project

This document explains how CORS is implemented in this repository, how it behaves at runtime, and how to configure or test it.

## Scope
- Backend framework: Express.
- CORS middleware: `cors` npm package.
- Configuration source: environment variable `CORS_ORIGIN` and defaults in `backend/src/config/env.js`.

## Where CORS Is Configured
- Middleware is set up in `backend/src/app.js`.
- Allowed origins are built in `backend/src/config/env.js`.
- Dependency is declared in `backend/package.json`.

## Allowed Origins Logic
The backend computes `corsOrigins` like this:
1. Read `CORS_ORIGIN` from `.env`.
2. If empty, fall back to defaults: `http://localhost:4000`, `http://127.0.0.1:4000`, `http://localhost:5500`, `http://127.0.0.1:5500`, `http://localhost:3000`.
3. Split by commas and trim whitespace.
4. Reject configuration if the list is empty.
5. Reject configuration if it includes `*`.

## Runtime Behavior
The CORS middleware in `backend/src/app.js` does the following:
1. If the request has no `Origin` header, it is allowed.
2. If `NODE_ENV` is not production and `Origin` is `null`, it is allowed.
3. If `Origin` is in the allowed list, it is allowed.
4. Otherwise, the request is rejected with a 403 error and a `cors_blocked` log entry.

## Credentials
`credentials: true` is enabled. This means:
- The response includes `Access-Control-Allow-Credentials: true`.
- The server must return an explicit origin, not `*`.
- The frontend must send credentials explicitly (for example, `fetch(..., { credentials: "include" })`).

## Preflight Handling
The `cors` package handles preflight requests automatically.
If the origin is not allowed, the preflight is rejected the same way as a normal request.

## How To Update Allowed Origins
1. Edit `backend/.env` and set `CORS_ORIGIN` to a comma-separated list of allowed origins.
2. Restart the backend server.

Example:
```
CORS_ORIGIN=http://localhost:3000,https://app.company.com
```

## How To Test
Use curl to simulate a browser origin:
```bash
curl -i -H "Origin: http://localhost:3000" http://localhost:4000/api/health
```

Test a blocked origin:
```bash
curl -i -H "Origin: http://evil.example" http://localhost:4000/api/health
```

## Common Issues
- Server fails to start due to CORS: check that `CORS_ORIGIN` is not empty and does not include `*`.
- Requests blocked unexpectedly: ensure the exact frontend origin string is listed, including scheme and port.
- Browser still blocks: confirm the frontend is sending credentials if the backend expects cookies.

## File References
- `backend/src/app.js`
- `backend/src/config/env.js`
- `backend/package.json`
