// Verify backend password helpers and validation rules.

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getPasswordValidationError,
  hashPassword,
  isBcryptHash,
  verifyPassword
} = require("../src/utils/password");

// Cover the primary success and failure cases for this module.
test("hashPassword creates a bcrypt hash and verifyPassword validates it", async () => {
  const plain = "TempPass@123";
  const hashed = await hashPassword(plain);

  assert.equal(isBcryptHash(hashed), true);

  const matched = await verifyPassword(hashed, plain);
  assert.equal(matched.matched, true);
  assert.equal(matched.legacy, false);

  const notMatched = await verifyPassword(hashed, "WrongPass@123");
  assert.equal(notMatched.matched, false);
});

test("verifyPassword supports legacy plaintext comparison", async () => {
  const legacy = await verifyPassword("legacy-plain", "legacy-plain");
  assert.equal(legacy.matched, true);
  assert.equal(legacy.legacy, true);
});

test("getPasswordValidationError enforces strong password policy", () => {
  assert.equal(getPasswordValidationError("short"), "Password must be at least 8 characters long.");
  assert.equal(getPasswordValidationError("alllowercase1!"), "Password must include at least one uppercase letter.");
  assert.equal(getPasswordValidationError("ALLUPPERCASE1!"), "Password must include at least one lowercase letter.");
  assert.equal(getPasswordValidationError("NoNumbers!"), "Password must include at least one number.");
  assert.equal(getPasswordValidationError("NoSpecial123"), "Password must include at least one special character.");
  assert.equal(getPasswordValidationError("StrongPass@123"), null);
});
