const crypto = require("crypto");
const logger = require("../utils/logger");

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const headerRequestId = String(req.headers["x-request-id"] || "").trim();
  const requestId = headerRequestId || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info("http_request", {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      status_code: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
      ip: req.ip
    });
  });

  next();
}

module.exports = requestLogger;
