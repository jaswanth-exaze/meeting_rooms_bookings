# Bcrypt End-to-End Documentation

This document explains how password hashing works in this project, how bcrypt is used end to end, and how to pin the bcrypt dependency version. It is tailored to the current backend implementation and database workflow.

## Scope

- Backend: Node.js + Express.
- Library: `bcryptjs` (pure JavaScript bcrypt implementation).
- Data: Employee passwords stored in the `employee.password` column.
- Flows: Login, legacy password upgrade, change password.

## Current Implementation (Repo-Specific)

- Hashing utilities live in `backend/src/utils/password.js`.
- Dependency is declared in `backend/package.json` as `bcryptjs`.
- Default cost factor (rounds) is `12`.
- Bcrypt hashes are detected by the regex `^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$`.
- Password policy is enforced in `getPasswordValidationError`.

## Password Policy (Validation)

The backend enforces the following when changing passwords:

- Minimum length: 8 characters.
- At least one lowercase letter.
- At least one uppercase letter.
- At least one number.
- At least one special character.

## End-to-End Flows

### Login Flow

1. User submits email and password to `POST /api/auth/login`.
2. Backend queries the employee record and reads `employee.password`.
3. `verifyPassword` checks whether `employee.password` is a bcrypt hash; if yes it uses `bcrypt.compare`, otherwise it compares plaintext directly (legacy support).
4. If matched:
   A JWT is created and set in an HttpOnly cookie, and `last_login_at` is updated when available.

### Legacy Password Upgrade on Login

If the stored password is not bcrypt-formatted:

1. The plaintext is verified directly.
2. On success, a new bcrypt hash is created with 12 rounds.
3. The DB row is updated with the new bcrypt hash, `password_reset_required = 1`, and `password_updated_at` / `last_login_at` when those columns exist.
4. The user is flagged to change their password.

### Change Password Flow

1. User submits `current_password` and `new_password` to `POST /api/auth/change-password`.
2. Backend verifies `current_password` via `verifyPassword`.
3. `new_password` is validated with `getPasswordValidationError`.
4. On success, a new bcrypt hash is created, `password` is updated, `password_reset_required` is cleared to `0`, and `password_updated_at` is set when the column exists.

## Data Storage Expectations

- `employee.password` should contain a bcrypt hash, not plaintext.
- The project supports legacy plaintext only for migration and will re-hash on successful login.
- The `password_reset_required` flag is used to force a user to update their password after legacy upgrade.

Example bcrypt hash format:

```
$2b$12$y4C2bKQ1wS4S6g4Y8m5xjOe0aUuJw1D6vGQhVw6q3gY6B7lTnE3fy
```

## Generating Bcrypt Hashes for Seed Data

If you need to seed the database with bcrypt hashes (recommended for safety), run:

```bash
cd backend
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TempPass@123', 12).then(console.log)"
```

Use the output hash in `employee.password` when updating seed data.

## Dependency Pinning (No pip, use npm)

This project is Node-based, so dependency pinning is done with npm, not pip.

To pin `bcryptjs` to an exact version:

1. Update `backend/package.json` to use an exact version (change `"bcryptjs": "^2.4.3"` to `"bcryptjs": "2.4.3"`).
2. Update the lockfile by running `npm install` (or `npm install --package-lock-only`).

Alternative command:

```bash
cd backend
npm install --save-exact bcryptjs@2.4.3
```

To keep installs reproducible in CI, prefer:

```bash
cd backend
npm ci
```

## Tests

Password behavior is covered in:

- `backend/test/password.test.js`

Run tests:

```bash
cd backend
npm test
```

## Configuration and Tuning

- Cost factor (rounds) is set in `backend/src/utils/password.js` as `BCRYPT_ROUNDS`.
- Increasing rounds improves security but increases CPU time.
- If you change the rounds value, only newly hashed passwords will use the new cost. Existing hashes remain valid.

## Troubleshooting

- `Invalid credentials.` on login: verify the user exists, the password is correct, and `employee.password` is a bcrypt hash or matching legacy plaintext.
- Password validation errors on change: read the validation message to identify missing requirements.
- Legacy upgrade not occurring: confirm `employee.password` does not already match the bcrypt pattern.

## File References

- `backend/src/utils/password.js`
- `backend/src/controllers/auth.controller.js`
- `backend/test/password.test.js`
- `backend/package.json`
- `backend/README.md `
