// Provide not found middleware.

// Return a 404 response for unknown routes.
function notFound(req, res, _next) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
}

module.exports = notFound;
