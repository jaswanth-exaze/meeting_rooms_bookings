function errorHandler(err, _req, res, _next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err?.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && err?.stack ? { stack: err.stack } : {})
  });
}

module.exports = errorHandler;
