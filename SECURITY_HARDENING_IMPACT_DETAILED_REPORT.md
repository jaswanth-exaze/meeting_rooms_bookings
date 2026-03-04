# Security Hardening Impact Detailed Report

## 1) Objective
This report documents the security hardening work completed, how each change functions technically, and the expected impact on this project.

It also includes rollout and operational guidance to avoid regressions.

---

## 2) Security Baseline Before vs After

### Before
1. plaintext password compare/store paths existed
2. open CORS fallback could allow broad origins
3. weak/default JWT secret fallback risk
4. frontend token model depended on localStorage
5. no auth-focused rate limiting
6. limited auditability for booking lifecycle actions

### After
1. bcrypt password hashing with strong policy
2. cookie-based session model (HttpOnly)
3. strict env validation for JWT secret and CORS origins
4. auth rate limiting in route chain
5. request logging + safer production error output
6. booking action audit trail + explicit `vacated` status support

---

## 3) Implemented Controls by Layer

## 3.1 Identity & Credential Controls

### 3.1.1 Password hashing utility
File:
- `backend/src/utils/password.js`

Implemented:
1. bcrypt hashing
2. bcrypt hash detection
3. verify method supporting both bcrypt and legacy plaintext
4. password complexity validation

Impact:
- protects stored credentials from immediate disclosure in case of DB exposure
- enforces higher password quality for active users
- allows controlled migration without hard lockout

### 3.1.2 Login controller hardening
File:
- `backend/src/controllers/auth.controller.js`

Implemented:
1. legacy plaintext auto-upgrade to bcrypt on successful login
2. `password_reset_required` flag management
3. cookie issue/clear behavior
4. `me`, `logout`, `change-password` endpoints

Impact:
- smooth migration path from old auth data
- supports mandatory password rotation policy
- cleanly separates session handling from frontend token storage

---

## 3.2 Session & Transport Controls

### 3.2.1 Cookie session model
Files:
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/requireAuth.js`
- frontend request wrappers

Implemented:
1. HttpOnly cookie session auth
2. `credentials: include` in frontend API calls
3. bearer fallback retained for compatibility

Impact:
- reduces XSS token theft risk compared to localStorage token usage
- centralizes auth state in browser cookie policy

### 3.2.2 Cookie policy configuration
File:
- `backend/src/config/env.js`

Implemented:
1. `AUTH_COOKIE_NAME`
2. `AUTH_COOKIE_SAME_SITE`
3. `AUTH_COOKIE_SECURE`
4. `AUTH_COOKIE_MAX_AGE`
5. validation for invalid combinations (`SameSite=None` without secure)

Impact:
- safer defaults and explicit session behavior by environment

---

## 3.3 Origin & Secret Hardening

### 3.3.1 CORS allowlist
Files:
- `backend/src/config/env.js`
- `backend/src/app.js`

Implemented:
1. comma-separated CORS origin parsing
2. wildcard `*` disallowed
3. origin callback enforcement with logging
4. credentials-enabled CORS

Impact:
- reduces unauthorized origin access to authenticated APIs
- makes deployment misconfiguration visible earlier

### 3.3.2 JWT secret strictness
File:
- `backend/src/config/env.js`

Implemented:
1. minimum secret length checks
2. known placeholder secret rejection
3. fail-fast startup if invalid

Impact:
- prevents accidental weak-secret deployments
- significantly reduces token forgery risk from configuration mistakes

---

## 3.4 Abuse Prevention

### 3.4.1 Auth rate limiting
File:
- `backend/src/middleware/authRateLimit.js`

Route usage:
- `/auth/login`
- `/auth/change-password`

Implemented:
1. in-memory attempt window
2. threshold enforcement
3. `Retry-After` response

Impact:
- slows brute-force and password stuffing attempts
- reduces repeated credential guess pressure

Note:
- current store is in-memory and per-instance (not distributed).

---

## 3.5 Error Handling and Observability

### 3.5.1 Request logging and request IDs
Files:
- `backend/src/middleware/requestLogger.js`
- `backend/src/utils/logger.js`

Implemented:
1. structured log output (JSON-like payloads)
2. request ID generation/propagation
3. request duration and response code logging

Impact:
- improves incident triage and traceability
- easier correlation across frontend error reports and backend logs

### 3.5.2 Error output masking
File:
- `backend/src/middleware/errorHandler.js`

Implemented:
1. 5xx generic user-safe message in production
2. stack details only in development mode

Impact:
- reduces sensitive internal detail leakage to clients
- preserves developer diagnostics in non-production

### 3.5.3 Security headers
File:
- `backend/src/middleware/securityHeaders.js`

Implemented:
1. `X-Content-Type-Options`
2. `X-Frame-Options`
3. `Referrer-Policy`
4. `Permissions-Policy`
5. `Cross-Origin-Resource-Policy`
6. HSTS in production

Impact:
- raises baseline browser-side defense posture

---

## 3.6 Booking Integrity and Auditability

### 3.6.1 `vacated` lifecycle status
Files:
- `backend/src/controllers/booking.controller.js`
- DB migration/schema files

Implemented:
1. explicit `vacated` booking status
2. vacate action updates end time + status
3. operation restrictions for cancelled/vacated records

Impact:
- clearer booking lifecycle semantics
- less ambiguity in UI and reporting

### 3.6.2 Booking audit trail
Files:
- `backend/src/controllers/booking.controller.js`
- migration `booking_audit` table

Implemented:
1. action logging for created/updated/cancelled/vacated
2. actor, status transition, time-window snapshots

Impact:
- forensic timeline for booking governance
- better accountability for operational disputes

---

## 4) Database-Side Security Changes

Migration file:
- `database/migrations/2026-03-04-security-hardening-and-booking-audit.sql`

Schema additions:
1. employee security metadata columns
2. booking status enum extension for `vacated`
3. `booking_audit` table creation

Sanitization:
- `database/database1.sql` now redacts sample password values (no real-like plaintext credential dump)

Compatibility safeguards:
1. backend handles missing new columns with fallback queries
2. audit insert path guards if table not yet available

Impact:
- safer staged rollout without immediate hard failure in partially migrated environments

---

## 5) Frontend Security-Related Changes

Files:
- `frontend/js/config.js`
- `frontend/js/login.js`
- `frontend/js/home.js`
- `frontend/js/role-dashboard.js`
- `frontend/dashboard.html`

Implemented:
1. centralized API base resolution to reduce host mismatch session issues
2. cookie-auth request pattern with `credentials: include`
3. removal of runtime dependency on stored bearer token
4. profile change-password workflow integration
5. robust `/auth/me` session validation gate before dashboard operation

Impact:
- more reliable and secure session behavior
- less auth-state drift between pages
- improved controlled redirects for invalid session state

---

## 6) Testing & CI Hardening

Files:
- `backend/test/password.test.js`
- `backend/test/env.test.js`
- `.github/workflows/backend-ci.yml`

Implemented:
1. tests for password hashing/verification/policy
2. tests for env secret/CORS validation behavior
3. CI pipeline for install + syntax check + test execution

Impact:
- catches critical auth/config regressions early
- improves confidence in future changes

---

## 7) Risk Reduction Summary

Directly reduced risks:
1. credential-at-rest exposure
2. brute-force automation effectiveness
3. deployment-time weak secret mistakes
4. unrestricted cross-origin access
5. internal error detail leakage
6. weak audit evidence for booking actions

Operationally improved:
1. diagnostics and observability
2. role/session consistency
3. controlled user recovery path via forced password reset

---

## 8) Residual Risks / Future Hardening Opportunities

1. Rate limiter is in-memory only (not shared across instances).
2. No MFA yet for privileged users.
3. No centralized SIEM/security alert pipeline yet.
4. No explicit account lockout escalation policy yet.
5. No automated secret rotation process yet.

Recommended next phase:
1. distributed rate limiter (Redis)
2. admin MFA
3. suspicious login alerting
4. scheduled password expiration policy (if org policy requires)
5. CSP policy tightening for frontend

---

## 9) Rollout Checklist

1. Run security migration in target DB.
2. Set strong production `.env` values (`JWT_SECRET`, strict `CORS_ORIGIN`, cookie settings).
3. Ensure frontend and backend use consistent hostnames in each environment.
4. Validate login + `/auth/me` + forced password reset path.
5. Validate vacate + audit trail records in DB.
6. Confirm CI passing before production push.

---

## 10) Final Impact Statement
The project moved from a functional booking app to a substantially stronger production-ready baseline with:
- hardened authentication
- safer session handling
- better defensive defaults
- improved observability
- auditable booking lifecycle

This security posture is materially better for real employee usage at scale and provides a solid base for next-level enterprise controls.
