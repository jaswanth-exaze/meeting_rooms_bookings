// Verify backend environment configuration validation rules.

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.join(__dirname, "..");

// Spawn a child process that attempts to load the env module with overrides.
function runEnvProbe(extraEnv) {
  return spawnSync(process.execPath, ["-e", "require('./src/config/env')"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: "4000",
      DB_HOST: "127.0.0.1",
      DB_PORT: "3306",
      DB_USER: "root",
      DB_PASSWORD: "",
      DB_NAME: "meeting_room_booking",
      ...extraEnv
    },
    encoding: "utf8"
  });
}

// Cover the primary success and failure cases for this module.
test("env config loads with explicit secure JWT and CORS origins", () => {
  const result = runEnvProbe({
    CORS_ORIGIN: "http://localhost:5500",
    JWT_SECRET: "this_is_a_valid_very_long_random_secret_12345",
    JWT_EXPIRES_IN: "2h"
  });

  assert.equal(result.status, 0, `Expected env module to load, got: ${result.stderr}`);
});

test("env config rejects weak/default JWT secret", () => {
  const result = runEnvProbe({
    CORS_ORIGIN: "http://localhost:5500",
    JWT_SECRET: "dev_jwt_secret_change_me"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET/i);
});

test("env config rejects wildcard CORS origin", () => {
  const result = runEnvProbe({
    CORS_ORIGIN: "*",
    JWT_SECRET: "this_is_a_valid_very_long_random_secret_12345"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CORS_ORIGIN/i);
});
