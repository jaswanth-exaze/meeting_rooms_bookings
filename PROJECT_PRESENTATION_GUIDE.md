# Meeting Room Booking Platform - Presentation Playbook

Use this as a full script to explain and demo the project. It covers story, roles, features, demo order, code jump points, architecture, security, data model, assets, runbook, troubleshooting, metrics, and roadmap.

## 1) One-minute pitch
- Problem: teams lose time finding the right room across locations; clashes and no-shows hurt productivity.
- Solution: a role-aware booking platform with live availability, amenity matching, and auditability for admins.
- Stack: MySQL + Node.js/Express API with JWT HttpOnly auth, static HTML/CSS/vanilla JS frontends, brand-aligned AI imagery and video.

## 2) Audience framing
- Leaders: governance, auditability, policy control, adoption speed.
- IT/security: strict CORS allowlist, HttpOnly cookies, rate-limited auth, HSTS, DB constraints.
- Users: book in three clicks, clear visuals, mobile-friendly layout, dark/light themes.

## 3) Roles and personas
- Employee: find rooms by time, capacity, amenities; book, cancel, vacate; view upcoming bookings.
- Admin: manage employees and rooms, view summaries and reports, see audit trail, enforce access via rolecheck middleware.

## 4) Feature checklist by role
- Employee: room finder cards with images and amenity icons; 30-minute grid; conflict-aware booking; participant picker; booking summary; cancel/vacate; timezone label (IST override); skeleton loaders.
- Admin: employee directory search/filter/pagination (client-side); add/delete employees; create rooms; view room directories; booking audit and reports; refresh controls.
- Cross-cutting: dark/light theme toggle; responsive layout; brand-consistent media; security headers; rate-limited auth; HttpOnly cookies; CORS allowlist.

## 5) Demo flow (UI on the left, code on the right)
1. Home landing (`frontend/home.html`): hero video loop, logo palette, dark/light toggle.
2. Login: form handled by `frontend/js/login.js` calling `POST /api/auth/login`; note HttpOnly cookie (no localStorage tokens).
3. Employee dashboard (`frontend/dashboards/employee-dashboard.html`): room cards with AI renders; pick time via Flatpickr; book; show My Bookings; cancel or vacate to demonstrate status change.
4. Admin dashboard (`frontend/dashboards/admin-dashboard.html`): employee directory search/filter per `EMPLOYEE_SEARCH_GUIDE.md`; add a room; view booking reports.
5. Security moment: call API from a disallowed origin to show CORS block or observe masked error responses; point to rate limiting and headers.

## 6) Code jump points for the demo
- Entry and config: `frontend/home.html`, `frontend/js/config.js`, `frontend/js/login.js`.
- Dashboards and state: `frontend/js/role-dashboard.js`, `frontend/dashboards/*.html`.
- Styling and theming: `frontend/css/styles.css` (theme toggle, skeletons, layout).
- API surface: `backend/src/routes/*.js` and controllers under `backend/src/controllers/`.
- Middleware: `backend/src/middleware/securityHeaders.js`, `authRateLimit.js`, `requestLogger.js`, `requireAuth.js`, `rolecheck.js`, `errorHandler.js`, `notFound.js`.
- Environment validation: `backend/src/config/env.js`.
- DB schema and migrations: `database/database1.sql`, `database/migrations/`.

## 7) Architecture at a glance
- Frontend: static assets served from Express; Flatpickr for date/time; Leaflet for maps; localStorage only for theme and cached auth employee object.
- Backend: Express app (`backend/src/app.js`) with static frontend hosting, JSON body limit, route modules, centralized error handling; server bootstrap in `backend/src/server.js` with DB health check.
- Database: MySQL with foreign keys and CHECK constraints; audit table for booking changes; participant junction for attendees.
- Auth: JWT signed with strong secret, stored as HttpOnly cookie `mrb_auth`; Bearer fallback supported.
- Config: environment parsing rejects weak JWT secrets and wildcard CORS; SameSite + Secure enforcement when needed.

## 8) API map (callouts during demo)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password` (rate limited).
- Employees: `GET /api/employees/search` (auth).
- Rooms: `GET /api/rooms`, `GET /api/rooms/:roomId`, `GET /api/rooms/:roomId/schedule` (auth).
- Locations: `GET /api/locations`.
- Bookings: `GET /api/bookings/upcoming`, `GET /api/bookings/summary`, `GET /api/bookings/reports`, `GET /api/bookings/:bookingId`, `POST /api/bookings`, `PATCH /api/bookings/:bookingId`, `PATCH /api/bookings/:bookingId/cancel`, `PATCH /api/bookings/:bookingId/vacate` (auth).
- Admin: `GET/POST/DELETE /api/admin/employees`, `GET/POST /api/admin/rooms` (auth + admin).

## 9) Middleware and security highlights
- CORS allowlist with explicit origins; wildcard rejected at startup.
- Security headers: no-sniff, frame denial, referrer policy, permissions policy, CORP; HSTS in production.
- Auth rate limit: 10 attempts per 15 minutes keyed by IP+email with Retry-After.
- Auth guard: `requireAuth` parses HttpOnly cookie or Bearer; `rolecheck` enforces admin.
- Error masking: production responses hide stack traces.
- Request logging: structured logs for all routes.

## 10) Data model talking points
- employee: identity, role flag, department, project, location, gender, status.
- meeting_room: name, capacity, amenity booleans, location link.
- booking: start/end with CHECK end > start; status enum (confirmed, cancelled, pending, vacated); FK to room and employee.
- booking_participants: unique attendee per booking, added_by reference.
- booking_audit: immutable actions (created, updated, cancelled, vacated) with before/after times and statuses.

## 11) UI and branding specifics
- Assets: AI room renders and avatars in `frontend/assets/`; hero videos `home_page_hero_video*.mp4`.
- Typography: Plus Jakarta Sans and Sora to match logo weight.
- Interaction polish: fade-rise entrances, skeleton placeholders, icon set for amenities, gendered profile images.
- Theme: toggle persists in `localStorage` key `dashboard_theme_preference`.

## 12) Data flow story to narrate
- Login: browser form -> `POST /api/auth/login` -> `auth.controller` issues JWT -> HttpOnly cookie set -> `GET /api/auth/me` hydrates UI.
- Booking: user selects slot -> `POST /api/bookings` -> booking, participants, audit rows created -> response updates state -> availability and My Bookings re-render.
- Admin room create: `POST /api/admin/rooms` -> room directory reload -> filters and cards repopulated.

## 13) Runbook (dev)
```bash
# Database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS meeting_room_booking;"
mysql -u root -p meeting_room_booking < database/database1.sql
# apply migrations in timestamp order from database/migrations/

# Backend
cd backend
cp .env.example .env    # set JWT_SECRET (>=32 chars) and CORS_ORIGIN list
npm install
npm run dev             # API at http://localhost:4000, frontend served at /frontend

# Frontend
# Open http://localhost:4000/frontend/home.html
```

## 14) Deployment notes
- Serve behind TLS; set `AUTH_COOKIE_SECURE=true` and adjust SameSite for your domain.
- Pin CORS origins to the production frontend host.
- Use managed MySQL with backups and slow-query log.
- Run `npm start` under PM2/systemd; health check `/api/health`; enable log rotation.

## 15) Performance and resilience
- Connection pooling via mysql2; DB health check before listen.
- Client-side filtering/pagination for admin directory keeps searches instant after initial fetch.
- 1 MB JSON body cap; auth rate limiting; graceful shutdown closes the pool.

## 16) Testing and validation prompts
- Auth: exceed 10 bad logins and expect 429 with Retry-After.
- Booking: try overlapping time to confirm rejection; cancel then vacate to see status and audit change.
- Admin search: combine department and role filters; reset filters; verify pagination.
- CORS: call API from disallowed origin and expect 403.
- Theme: toggle dark/light and reload to confirm persistence.

## 17) Troubleshooting quick list
- 401 after login: check JWT_SECRET length, cookie domain/same-site, and that requests include credentials.
- CORS errors: ensure `CORS_ORIGIN` matches exact protocol/host/port.
- DB start failures: verify DB env vars; run `SELECT 1` manually.
- Missing assets: confirm Express static path `/frontend` and relative URLs in HTML.

## 18) Metrics to cite
- Time to book: about three clicks from dashboard with cached directories.
- Admin search latency: client-side, effectively zero server round-trips after load.
- Security posture: HttpOnly cookies, strict CORS, HSTS (prod), auth rate limit 10 per 15 minutes.

## 19) Roadmap talking points
- Add notifications (email or chat) on create/update/cancel.
- Add recurring bookings and utilization analytics.
- Swap client-side admin search for server-side when directory grows.
- Integrate SSO for JWT issuance.

## 20) FAQ and glossary
- Vacate vs cancel: vacate releases a booked slot without deleting history; cancel voids before start.
- Participant picker: adds employees to booking_participants with uniqueness constraint.
- HttpOnly cookie: protects JWT from script access; Bearer header supported for tools.
- Audit: booking_audit captures who changed what and when with before/after times and statuses.

Keep this open while presenting: mirror each UI action with the matching code file and mention the middleware or DB constraint that enforces what the audience sees.
