// Provide async handler middleware.

// Wrap async handlers and forward failures to Express.
function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
