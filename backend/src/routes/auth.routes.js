// Register auth API endpoints and middleware.

const express = require("express");
const { changePassword, login, logout, me } = require("../controllers/auth.controller");
const requireAuth = require("../middleware/requireAuth");
const authRateLimit = require("../middleware/authRateLimit");

// Create the router for this resource.
const router = express.Router();

// Attach middleware and controller handlers to each route.
router.post("/login", authRateLimit, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, authRateLimit, changePassword);

module.exports = router;
