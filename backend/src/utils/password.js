const bcrypt = require("bcryptjs");

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const BCRYPT_ROUNDS = 12;

function normalizePassword(value) {
  return String(value || "");
}

function isBcryptHash(value) {
  return BCRYPT_HASH_PATTERN.test(String(value || ""));
}

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

async function hashPassword(value) {
  const password = normalizePassword(value);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

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
