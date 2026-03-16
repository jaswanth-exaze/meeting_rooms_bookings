# MySQL2 End-to-End in This Project

This document explains how the `mysql2` library is used in the backend, why it is used, and how database queries flow end to end.

## Scope
- Runtime: Node.js backend.
- Library: `mysql2` with the promise API.
- Data source: MySQL database defined in `backend/src/config/env.js`.

## Why We Use mysql2
- Fast and widely used MySQL client for Node.js.
- Promise-based API for async/await.
- Supports prepared statements and connection pooling.

## Where It Is Used
- `backend/src/config/db.js` creates the connection pool.
- `backend/src/config/env.js` defines DB environment variables.
- Controllers call `query` for all DB access.
- `backend/src/server.js` tests the DB connection on startup.

## Dependency Details
- Dependency is defined in `backend/package.json` as `mysql2`.
- The code uses `mysql2/promise` to get async APIs.

## Environment Configuration
Database settings are loaded from `.env`:
- `DB_HOST` defaults to `127.0.0.1`.
- `DB_PORT` defaults to `3306`.
- `DB_USER` defaults to `root`.
- `DB_PASSWORD` defaults to empty string.
- `DB_NAME` defaults to `meeting_room_booking`.

## Connection Pool Settings
The pool is created with these settings:
- `waitForConnections: true` to queue when busy.
- `connectionLimit: 10` to cap concurrent connections.
- `queueLimit: 0` for unlimited queue length.
- `timezone: "Z"` for UTC behavior.

## Query Helper
`backend/src/config/db.js` exposes:
- `pool` for direct access if needed.
- `query(sql, params)` which wraps `pool.execute`.
- The helper returns only `rows` for convenience.

## Startup Flow
1. `backend/src/server.js` runs `query("SELECT 1")`.
2. If successful, the server listens on the configured port.
3. If it fails, a structured log is emitted and the process exits.

## Request-to-Query Flow
1. A request hits an Express route.
2. The controller builds a SQL query with parameters.
3. `query` executes the SQL via the pool.
4. Rows are returned and mapped to JSON.
5. The response is sent to the client.

## Parameterization and Safety
- All user input should be passed as parameters.
- `pool.execute` prevents SQL injection by binding values.
- Avoid string concatenation for user-provided values.

## Read and Write Patterns
- `SELECT` queries return arrays of rows.
- `INSERT` and `UPDATE` return metadata in result objects.
- Controllers handle `ER_BAD_FIELD_ERROR` in legacy schemas.

## Migrations and Schema
- Base schema lives in `database/database1.sql`.
- Additional migrations live in `database/migrations`.
- Controllers expect certain columns to exist but handle legacy cases.

## Schema Expectations Used By Code
- `employee` table includes `employee_id`, `email`, `password`, `is_admin`.
- `employee` table may include `password_reset_required` in newer migrations.
- `booking` table includes room, employee, and time fields.
- `location` table provides office locations.
- `room` table stores room metadata and capacity.
- Admin reports join multiple tables for analytics.

## Example Parameterized Query
```js
const rows = await query(
  "SELECT employee_id, email FROM employee WHERE email = ? LIMIT 1",
  [normalizedEmail]
);
```

## Example Write Query
```js
await query(
  "UPDATE employee SET last_login_at = UTC_TIMESTAMP() WHERE employee_id = ?",
  [employeeId]
);
```

## Example Booking Query
```js
const rows = await query(
  "SELECT booking_id, room_id, start_time, end_time FROM booking WHERE room_id = ?",
  [roomId]
);
```

## Timezone Behavior
- Pool uses UTC for timestamps.
- The code uses `UTC_TIMESTAMP()` in several queries.
- This ensures consistent date/time storage.

## Error Handling Strategy
- Startup DB failures log `server_start_failed`.
- Controllers catch specific DB errors where needed.
- Unknown DB errors bubble to the error handler.

## Shutdown Behavior
- `SIGINT` and `SIGTERM` trigger `pool.end()`.
- This allows clean shutdown of DB connections.

## Testing and Validation
- There is no dedicated DB unit test suite in this repo.
- Manual testing is done via API endpoints.
- The `SELECT 1` check validates connectivity at startup.

## Performance Considerations
- Keep queries indexed and selective.
- Limit result sets with `LIMIT` where possible.
- Avoid N+1 query patterns in controllers.
- Consider batching for reporting endpoints.

## Query Map by Feature Area
- Auth uses `SELECT` to fetch employee credentials.
- Auth uses `UPDATE` to store bcrypt hashes and reset flags.
- Bookings use `SELECT` to list schedules and conflicts.
- Bookings use `INSERT` to create reservations.
- Bookings use `UPDATE` to modify existing reservations.
- Bookings use `DELETE` to cancel reservations.
- Rooms use `SELECT` for inventory and availability.
- Locations use `SELECT` for office locations.
- Admin uses aggregated queries for reports.

## Controller Query Patterns
- `auth.controller.js` reads employee rows by email.
- `auth.controller.js` writes password updates and login timestamps.
- `employee.controller.js` lists and updates employee profiles.
- `booking.controller.js` checks conflicts before inserts.
- `booking.controller.js` joins rooms, locations, and employees.
- `room.controller.js` reads room metadata and schedules.
- `location.controller.js` reads location lists.
- `admin.controller.js` aggregates bookings and users.

## Pagination and Filtering Guidelines
- Always apply `LIMIT` and `OFFSET` for list endpoints.
- Use exact matches for IDs and emails.
- Use indexed columns for filter predicates.
- Validate sort fields to avoid SQL injection.
- Avoid unbounded `ORDER BY` on large tables.

## Data Integrity Guidelines
- Use transactions for multi-step updates that must be atomic.
- Enforce unique constraints for identifiers and emails.
- Validate foreign keys for booking relationships.
- Keep soft-delete rules consistent if introduced later.

## Monitoring Signals
- Track DB connection pool usage.
- Track slow query logs in MySQL.
- Track API latency spikes that correlate with DB time.
- Track DB error rates by error code.

## Production Readiness Notes
- Ensure `connectionLimit` matches DB max connections.
- Ensure database user has least-privilege grants.
- Ensure backups are scheduled and verified.
- Ensure migration scripts are executed in order.
- Ensure long-running queries are monitored.

## Local Development Notes
- Ensure MySQL is running locally.
- Create the database and import `database1.sql`.
- Run migrations in order after the base schema.

## Troubleshooting Checklist
- Confirm DB host and port are reachable.
- Confirm username and password are correct.
- Confirm database name exists.
- Confirm MySQL user has required privileges.
- Check for locked tables or long-running queries.
- Look for `ER_BAD_FIELD_ERROR` in legacy schema cases.
- Verify the server logs for `server_start_failed`.
- Check `DB_HOST` and `DB_PORT` for docker vs local mismatches.
- Ensure firewall rules allow the DB port.
- Confirm the DB user can connect from the API host.
- Check if the database is in read-only mode.
- Check for missing migrations after a schema change.

## Common DB Error Codes
- `ER_ACCESS_DENIED_ERROR` means credentials or host are wrong.
- `ER_BAD_DB_ERROR` means the database name does not exist.
- `ER_NO_SUCH_TABLE` means a table is missing or a migration failed.
- `ER_DUP_ENTRY` means a unique constraint was violated.
- `ER_PARSE_ERROR` means SQL syntax is invalid.

## Operational Notes
- Connection pool limits should match DB capacity.
- Consider separate read replicas for heavy reporting.
- Monitor slow queries and add indexes as needed.

## Optional Enhancements
- Add structured query logging for slow queries.
- Add transaction helpers for multi-step changes.
- Add a health check that tests a real query.
- Add retry logic for transient connection failures.
- Add pagination helpers for large datasets.

## Release Checklist
- Run schema migrations in staging.
- Validate DB connection strings in production.
- Verify `SELECT 1` health check on startup.
- Smoke test key endpoints after deploy.
- Review slow query logs post-release.
- Confirm backups are running after deploy.
- Monitor DB CPU and memory usage.
- Verify pool limits do not exceed DB max connections.
- Confirm the API can reconnect after a DB restart.

## Implementation Checklist
- Keep SQL queries parameterized.
- Verify connection pool settings for production load.
- Ensure migrations are applied consistently.
- Keep DB credentials out of source control.
- Run the startup connection check in all environments.
- Avoid `SELECT *` in performance-sensitive paths.
- Always limit list queries with pagination.
- Index columns used in filters and joins.
- Use UTC consistently in application and DB.
- Keep write queries as short as possible.
- Consider transactions for multi-step updates.
- Document any raw SQL in controllers.

## Glossary
- Pool: A set of reusable DB connections.
- Query: A SQL statement executed against the DB.
- Prepared Statement: A statement with bound parameters.
- Result Set: Rows returned from a query.
- Metadata: Info about affected rows for writes.
- Migration: Script that modifies the DB schema.
- Index: A data structure that speeds up lookups.

## File References
- `backend/src/config/db.js`
- `backend/src/config/env.js`
- `backend/src/server.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/employee.controller.js`
- `backend/src/controllers/booking.controller.js`
- `backend/src/controllers/room.controller.js`
- `backend/src/controllers/location.controller.js`
- `backend/src/controllers/admin.controller.js`
- `backend/package.json`
