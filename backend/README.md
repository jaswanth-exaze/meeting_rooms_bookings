# Backend Setup

## Tech Stack
- Node.js + Express
- MySQL (`mysql2`)
- JWT auth in HttpOnly cookie
- Password hashing with `bcryptjs`

## Project Structure
```text
backend/
  src/
    config/
      env.js
      db.js
    controllers/
      auth.controller.js
      location.controller.js
      room.controller.js
      booking.controller.js
      admin.controller.js
    middleware/
      asyncHandler.js
      authRateLimit.js
      errorHandler.js
      notFound.js
      requestLogger.js
      requireAuth.js
      rolecheck.js
      securityHeaders.js
    utils/
      logger.js
      password.js
    routes/
      auth.routes.js
      location.routes.js
      room.routes.js
      booking.routes.js
      admin.routes.js
    app.js
    server.js
  test/
  .env.example
  package.json
```

## Environment
1. Copy `backend/.env.example` to `backend/.env`.
2. Set a strong `JWT_SECRET` (minimum 32 chars).
3. Set explicit `CORS_ORIGIN` values (comma-separated). Wildcard `*` is not allowed.

## Database
1. Fresh setup from repo root: `mysql -u root -p < database/database-full-setup.sql`
2. Legacy/manual setup:
   - Import base schema: `database/database1.sql`
   - Run migrations in order from `database/migrations/`
3. `database1.sql` keeps employee passwords redacted for repo safety. Set real bcrypt password hashes before first login.

## Run
```bash
cd backend
npm install
npm run dev
```

Production:
```bash
npm start
```

API base URL:
`http://localhost:4000/api`

## Auth Endpoints
- `POST /api/auth/login`
- `POST /api/auth/logout` (requires auth)
- `GET /api/auth/me` (requires auth)
- `POST /api/auth/change-password` (requires auth)

Auth cookie is HttpOnly and sent automatically by browser with `credentials: include`.

## Security Notes
- Passwords are stored as bcrypt hashes.
- Legacy plaintext passwords are automatically upgraded to bcrypt on successful login and flagged for password reset.
- Login/change-password routes are rate-limited.
- Error responses are masked in production for server-side failures.
- CORS is allowlist-based.
