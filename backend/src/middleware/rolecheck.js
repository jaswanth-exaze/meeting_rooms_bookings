function requireAdmin(req, res, next) {
  if (req.user?.is_admin !== true) {
    return res.status(403).json({ message: "Admin access is required." });
  }

  next();
}

module.exports = requireAdmin;
