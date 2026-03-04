const { nodeEnv } = require("../config/env");

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

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[configuredLevel];
}

function serializeMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return {};
  }
  return meta;
}

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

function error(message, meta) {
  write("error", message, meta);
}

function warn(message, meta) {
  write("warn", message, meta);
}

function info(message, meta) {
  write("info", message, meta);
}

function debug(message, meta) {
  write("debug", message, meta);
}

module.exports = {
  debug,
  error,
  info,
  warn
};
