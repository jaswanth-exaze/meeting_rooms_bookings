# dotenv End-to-End in This Project

This document explains how `dotenv` is used in the backend, how configuration flows from `.env` into the runtime, and why this library is used.

## Scope
- Runtime: Node.js backend.
- Library: `dotenv`.
- Config file: `backend/.env`.
- Loader: `backend/src/config/env.js`.

## Why We Use dotenv
- Keeps secrets out of source code.
- Allows environment-specific configuration.
- Works with local development workflows.

## Where It Is Used
- `backend/src/config/env.js` loads `.env`.
- `backend/src/app.js` reads config for CORS and other settings.
- `backend/src/server.js` reads the configured port.
- Controllers read config values indirectly through `env.js`.

## How Loading Works in This Project
1. `env.js` calls `dotenv.config`.
2. The path is set to `backend/.env`.
3. Values are loaded into `process.env`.
4. The module validates and normalizes the values.
5. The rest of the app imports values from `env.js`.

## Environment Variables Used
Core app variables:
- `NODE_ENV` controls production behavior.
- `PORT` controls the HTTP port.

CORS variables:
- `CORS_ORIGIN` defines allowed origins.

JWT variables:
- `JWT_SECRET` is required and validated.
- `JWT_EXPIRES_IN` controls token lifetime.

Auth cookie variables:
- `AUTH_COOKIE_NAME` sets the cookie name.
- `AUTH_COOKIE_SECURE` controls Secure cookie behavior.
- `AUTH_COOKIE_SAME_SITE` controls SameSite behavior.
- `AUTH_COOKIE_MAX_AGE` controls cookie lifetime.

Database variables:
- `DB_HOST` database host.
- `DB_PORT` database port.
- `DB_USER` database user.
- `DB_PASSWORD` database password.
- `DB_NAME` database name.

## Detailed Variable Reference
- `NODE_ENV`: determines production vs development behavior.
- `PORT`: port passed to `app.listen`.
- `CORS_ORIGIN`: comma-separated allowlist for CORS.
- `JWT_SECRET`: secret used to sign JWTs.
- `JWT_EXPIRES_IN`: token lifetime, like `2h` or `15m`.
- `AUTH_COOKIE_NAME`: name of the auth cookie.
- `AUTH_COOKIE_SECURE`: whether cookies require HTTPS.
- `AUTH_COOKIE_SAME_SITE`: `lax`, `strict`, or `none`.
- `AUTH_COOKIE_MAX_AGE`: cookie lifetime in ms or duration.
- `DB_HOST`: hostname of the MySQL server.
- `DB_PORT`: numeric port for MySQL.
- `DB_USER`: MySQL username.
- `DB_PASSWORD`: MySQL password.
- `DB_NAME`: database name for the app schema.

## Validation Rules in env.js
- `JWT_SECRET` must be at least 32 chars and not a placeholder.
- `CORS_ORIGIN` must not be empty.
- `CORS_ORIGIN` must not contain `*`.
- `AUTH_COOKIE_SAME_SITE=none` requires `AUTH_COOKIE_SECURE=true`.

## Normalization Helpers
`env.js` normalizes values with helpers:
- `toNumber` for numeric settings.
- `toBoolean` for boolean flags.
- `parseCsv` for comma-separated lists.
- `parseDurationMs` for duration strings.

## Default Values
The module provides defaults for:
- `NODE_ENV` default to `development`.
- `PORT` default to `4000`.
- `CORS_ORIGIN` default list of localhost origins.
- `JWT_EXPIRES_IN` default to `2h`.

## Typed Parsing Examples
```js
const port = Number(process.env.PORT || 4000);
const secure = String(process.env.AUTH_COOKIE_SECURE) === "true";
```

## Example Validation Failures
- Missing `JWT_SECRET` causes startup failure.
- Weak `JWT_SECRET` triggers a validation error.
- `CORS_ORIGIN` set to `*` triggers a validation error.
- `AUTH_COOKIE_SAME_SITE=none` with insecure cookies triggers a validation error.


## End-to-End Configuration Flow
1. You set `backend/.env` values.
2. `dotenv` loads them at startup.
3. `env.js` validates and formats them.
4. Express uses them for middleware and routes.
5. Controllers use them to sign tokens and configure cookies.

## Example .env Entries
```
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=2h
AUTH_COOKIE_NAME=mrb_auth
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_MAX_AGE=2h
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meeting_room_booking
```

## Example Production Overrides
```
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://app.company.com
JWT_EXPIRES_IN=2h
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=none
```

## Environment Separation Guidance
- Use distinct secrets for dev, staging, and production.
- Use different DB hosts per environment.
- Keep production secrets in a managed secret store.
- Do not reuse staging secrets in production.
- Keep `.env` examples redacted in docs.

## How Values Are Consumed
- `corsOrigins` is used by the CORS middleware.
- `jwtSecret` and `jwtExpiresIn` are used when signing tokens.
- Cookie settings are applied to auth cookies.
- DB settings are used to build the MySQL connection pool.

## Config Consumption Map
- `backend/src/app.js` reads `corsOrigins` and `isProduction`.
- `backend/src/server.js` reads `port`.
- `backend/src/controllers/auth.controller.js` reads JWT and cookie settings.
- `backend/src/middleware/requireAuth.js` reads `jwtSecret`.
- `backend/src/config/db.js` reads `db` settings.

## Duration Parsing Examples
Supported formats include:
- `120000` for milliseconds.
- `30s` for 30 seconds.
- `15m` for 15 minutes.
- `2h` for 2 hours.
- `1d` for 1 day.

## Secret Rotation Steps
- Update `JWT_SECRET` in all environments.
- Deploy with both new and old secrets if using key rotation.
- Force re-authentication if rotation is immediate.
- Communicate planned rotation windows to teams.

## Common Mistakes
- Putting spaces around the `=` sign.
- Using quotes inconsistently across keys.
- Forgetting to restart the server after edits.
- Reusing secrets across environments.
- Setting `CORS_ORIGIN` without scheme or port.

## Audit Checklist
- Verify every required key is present.
- Verify secrets are not placeholders.
- Verify no `.env` files are committed.
- Verify local `.env` matches `.env` documentation.
- Verify `NODE_ENV` is set correctly.
- Verify `PORT` does not conflict with other services.

## Migration to Managed Secrets
- Identify all secrets currently stored in `.env`.
- Move production secrets to a managed secret store.
- Keep `.env` for local development only.
- Update deployment to inject env vars at runtime.
- Remove secrets from any shared documentation.

## .env Template Practices
- Provide a redacted `.env.example` if needed.
- Never include real secrets in examples.
- Document required keys in README files.

## Security Notes
- Never commit `.env` to version control.
- Use strong secrets for `JWT_SECRET`.
- Use different `.env` files per environment.
- Restrict DB credentials to least privilege.

## Local Development Notes
- Keep `.env` in `backend/`.
- Restart the server after changing `.env`.
- Use `development` for `NODE_ENV` locally.

## Production Notes
- Prefer environment variables injected by the host.
- Do not rely on `.env` files in production.
- Audit secrets and rotate them regularly.
- Use separate configs for staging and production.

## Configuration Hygiene
- Keep keys uppercase and consistent.
- Avoid spaces around the `=` sign.
- Use quotes for values with spaces.
- Store secrets in secret managers when possible.


## Troubleshooting Checklist
- Confirm `backend/.env` exists.
- Confirm required variables are set.
- Check for typos in variable names.
- Ensure `JWT_SECRET` meets validation rules.
- Ensure `CORS_ORIGIN` does not include `*`.
- Ensure `AUTH_COOKIE_SAME_SITE` and `AUTH_COOKIE_SECURE` are compatible.
- Restart the server after changes.

## Operational Notes
- In production, set variables via the host environment.
- Avoid storing secrets in deployment logs.
- Use secret managers where possible.
- Keep a record of required variables per environment.
- Validate secrets rotation with a smoke test.

## Release Checklist
- Verify all required variables are set.
- Verify secrets are not placeholders.
- Verify `CORS_ORIGIN` matches frontend origin.
- Verify `AUTH_COOKIE_*` values for HTTPS.
- Verify DB credentials connect successfully.
- Restart services to pick up new environment values.

## FAQ
Q: Where does dotenv read the file from?
A: In this project, it reads `backend/.env`.

Q: What happens if a variable is missing?
A: `env.js` uses defaults or throws for required keys.

Q: Can I store secrets in `.env` locally?
A: Yes, but never commit the file.

Q: Do I need dotenv in production?
A: Only if your platform does not inject env vars.

Q: Can I use multiple .env files?
A: Yes, by calling `dotenv.config` with different paths.


## Implementation Checklist
- Keep `env.js` as the single source of config.
- Validate values early and fail fast.
- Use defaults only for local development.
- Document all required variables.
- Keep sensitive variables out of the repo.

## Glossary
- Environment Variable: A key-value setting provided at runtime.
- `.env` File: A text file containing environment variables.
- Validation: Checks to ensure values are safe and correct.
- Normalization: Converting strings to the right types.

## File References
- `backend/src/config/env.js`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/.env`
- `backend/package.json`
