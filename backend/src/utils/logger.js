// Emit structured logs with environment-aware log levels.

const { nodeEnv } = require("../config/env");

// Define shared constants used throughout this module.
const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const configuredLevelRaw = String(process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"))
  .trim()
  .toLowerCase();
const configuredLevel = Object.prototype.hasOwnProperty.call(LEVELS, configuredLevelRaw)
  ? configuredLevelRaw
  : "info";

// Return whether the configured log level allows this message.
function shouldLog(level) {
  return LEVELS[level] <= LEVELS[configuredLevel];
}

// Normalize metadata so it can be logged safely.
function serializeMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return {};
  }
  return meta;
}

// Write a structured log entry when the level is enabled.
function write(level, message, meta) {
  if (!shouldLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...serializeMeta(meta)
  };
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }
  console.log(line);
}

// Log an error message.
function error(message, meta) {
  write("error", message, meta);
}

// Log a warning message.
function warn(message, meta) {
  write("warn", message, meta);
}

// Log an informational message.
function info(message, meta) {
  write("info", message, meta);
}

// Log a debug message.
function debug(message, meta) {
  write("debug", message, meta);
}

module.exports = {
  debug,
  error,
  info,
  warn
};
