// Validate, hash, and compare passwords consistently.

const bcrypt = require("bcryptjs");

// Define shared constants used throughout this module.
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const BCRYPT_ROUNDS = 12;

// Normalize password input before validation or hashing.
function normalizePassword(value) {
  return String(value || "");
}

// Return whether the value already looks like a bcrypt hash.
function isBcryptHash(value) {
  return BCRYPT_HASH_PATTERN.test(String(value || ""));
}

// Return the first password validation error, if any.
function getPasswordValidationError(value) {
  const password = normalizePassword(value);
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}

// Hash password.
async function hashPassword(value) {
  const password = normalizePassword(value);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password.
async function verifyPassword(storedPasswordRaw, providedPasswordRaw) {
  const storedPassword = normalizePassword(storedPasswordRaw);
  const providedPassword = normalizePassword(providedPasswordRaw);

  if (!storedPassword || !providedPassword) {
    return { matched: false, legacy: false };
  }

  if (isBcryptHash(storedPassword)) {
    return {
      matched: await bcrypt.compare(providedPassword, storedPassword),
      legacy: false
    };
  }

  return {
    matched: storedPassword === providedPassword,
    legacy: true
  };
}

module.exports = {
  getPasswordValidationError,
  hashPassword,
  isBcryptHash,
  verifyPassword
};
