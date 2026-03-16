# Express Internals

This document explains what Express is, how it works internally at a high level, and how requests move through its middleware and routing system.

## What Is Express
Express is a minimalist web framework for Node.js.
It provides routing, middleware, and request/response helpers on top of the Node HTTP server.

## Express Architecture (High-Level)
- An Express app is a function with a middleware stack.
- Each middleware can read or modify the request and response.
- Routing middleware matches path and HTTP method.
- Errors are passed to error-handling middleware.

## Request and Response Objects
Express wraps Node's `IncomingMessage` and `ServerResponse`.
It adds convenience methods such as:
- `res.json()` for JSON responses.
- `res.status()` for setting status codes.
- `req.params`, `req.query`, and `req.body` for parsed data.

## Middleware Chain
Middleware is executed in the order registered:
1. A middleware function receives `(req, res, next)`.
2. It can end the response or call `next()`.
3. If it passes an error to `next(err)`, Express skips to error handlers.

## Error-Handling Middleware
Error middleware is identified by the signature `(err, req, res, next)`.
It runs after all regular middleware and routes.
It should always end the response or call `next`.

## Routing Internals
Routing is based on:
- HTTP method (`GET`, `POST`, etc).
- Path patterns (`/api/bookings/:id`).
- Router stacks composed with `express.Router()`.

Express matches routes in the order they are registered.

## Layer and Stack Model
Internally, Express stores middleware and routes as "layers."
Each layer has:
- A path or route pattern.
- A handler function.
- Metadata for matching and error handling.

## Route Matching Details
- Paths are matched in declaration order.
- Dynamic segments are captured into params.
- A route with the same path but different method is treated separately.

## Route Parameters
Dynamic segments like `:id` are parsed into `req.params`.
Express uses path-to-regexp style matching for route patterns.

## Router Mounting
Routers can be mounted at a path prefix like `/api`.
The mount path is stripped when the router processes the request.
This allows clean modular route definitions.

## Case Sensitivity and Strict Routing
Express can be configured for:
- Case-sensitive routing.
- Strict routing that distinguishes trailing slashes.

These settings are optional and default to relaxed behavior.

## Query Strings
Express parses query strings into `req.query`.
The default parser is simple and handles basic key-value pairs.

## Body Parsing
Express delegates body parsing to middleware like `express.json()`.
Body parsing happens before routes need access to `req.body`.
Large payloads can be limited with size caps.

## Static File Serving
`express.static` serves files from a directory.
It handles caching headers and range requests.
It short-circuits the middleware chain when a file is found.

## Request Flow in Detail
1. Express builds a request and response object.
2. The first middleware runs.
3. Each middleware either ends the response or calls `next()`.
4. The router stack matches the path and method.
5. The handler sends a response.
6. The response is finished and the connection is closed or reused.

## Response Helpers
Common helpers include:
- `res.send()` for plain text or buffers.
- `res.json()` for JSON serialization.
- `res.redirect()` for redirects.
- `res.set()` for setting headers.

## Headers and Response Finalization
Headers can be set at any time before the response is sent.
Once `res.send` or `res.end` is called, headers are locked.
Express ensures proper status and header defaults.

## Async Handlers
Express does not automatically handle promise rejections.
Async handlers should use try/catch or a wrapper to forward errors.
This project uses a custom `asyncHandler` for controllers.

## `next` Semantics
`next()` passes control to the next matching layer.
`next("route")` skips remaining handlers for the current route.
`next(err)` enters error-handling middleware.

## Order and Short-Circuiting
If a middleware sends a response, the chain stops.
If it calls `next()`, control passes to the next middleware.
If it calls `next(err)`, control passes to error handlers.

## Sub-Routers
Routers can be mounted under a path prefix.
This allows modular route definitions per domain.
Routers can also have their own middleware stacks.

## Router-Level Middleware
Routers can register middleware that runs only for that router.
This is useful for authentication or validation at a group level.
Router middleware runs before route handlers in that router.

## Content Negotiation
Express can infer response content based on the method used.
`res.json()` always sets `Content-Type: application/json`.

## Settings and Configuration
Express supports settings like:
- `case sensitive routing`
- `strict routing`
- `trust proxy`
- `etag`

These settings affect routing and response behavior.

## Trust Proxy
When `trust proxy` is enabled, Express uses `X-Forwarded-*` headers.
This is important for correct client IP and protocol detection behind proxies.

## ETag Behavior
ETags allow clients to cache responses.
Express can generate ETags automatically unless disabled.

## Headers and CORS
Express itself does not implement CORS.
CORS is handled by external middleware.
Headers are set by middleware and route handlers.

## Response Locals
`res.locals` is a per-request storage object.
It is often used to pass data between middleware and handlers.

## App Locals
`app.locals` holds global values shared across requests.
It is useful for configuration or constants.

## Streaming Responses
Express can stream responses by writing to the response object.
Streaming is useful for large downloads or server-sent events.

## Request and Response Events
- `req` emits events for data and end.
- `res` emits `finish` when the response completes.
- Middleware can hook into these events for logging.

## Performance Considerations
- Middleware ordering affects performance.
- Avoid expensive work in global middleware.
- Prefer streaming for large payloads.
- Avoid blocking the event loop with CPU-heavy tasks.

## Security Considerations
- Validate input before using it.
- Use HttpOnly cookies for sensitive tokens.
- Apply rate limits to auth endpoints.
- Sanitize errors before returning to clients.

## Example Flow (Conceptual)
1. Request enters Express.
2. Logging middleware runs.
3. CORS middleware runs.
4. JSON parser runs.
5. Router matches `/api/bookings`.
6. Controller runs and sends JSON response.
7. Error middleware runs if something throws.

## Common Pitfalls
- Forgetting to `return` after sending a response.
- Registering error middleware before routes.
- Not handling async errors properly.
- Accepting large payloads without limits.

## Extended Pitfalls
- Mixing async and callback styles without error handling.
- Using `next()` after a response is already sent.
- Performing heavy CPU work in a route handler.
- Catching errors and not passing them to the error handler.

## Glossary
- Middleware: Function in the request chain.
- Router: A modular set of routes.
- Handler: Function that serves a route.
- Stack: Ordered list of middleware.
- Short-circuit: Ending the chain early.

## Summary Checklist
- Register middleware in correct order.
- Add error handlers last.
- Keep handlers async-safe.
- Keep responses consistent.
