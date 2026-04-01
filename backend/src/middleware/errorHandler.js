// Provide error handler middleware.

const logger = require("../utils/logger");

// Convert thrown errors into consistent API responses.
function errorHandler(err, req, res, _next) {
  const explicitStatus = Number(err?.status || err?.statusCode || 0);
  const statusCode =
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 0) ||
    (Number.isFinite(explicitStatus) && explicitStatus > 0 ? explicitStatus : 500);
  const isDev = String(process.env.NODE_ENV || "development").toLowerCase() === "development";
  const safeMessage =
    statusCode >= 500 ? "Something went wrong. Please try again later." : err?.message || "Request failed.";

  logger.error("request_error", {
    request_id: req.requestId,
    status_code: statusCode,
    method: req.method,
    path: req.originalUrl || req.url,
    error_message: err?.message || "Unknown error",
    ...(isDev && err?.stack ? { stack: err.stack } : {})
  });

  res.status(statusCode).json({
    message: safeMessage,
    request_id: req.requestId,
    ...(isDev && err?.stack ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
