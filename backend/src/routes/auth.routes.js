const express = require("express");
const { changePassword, login, logout, me } = require("../controllers/auth.controller");
const requireAuth = require("../middleware/requireAuth");
const authRateLimit = require("../middleware/authRateLimit");

const router = express.Router();

router.post("/login", authRateLimit, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, authRateLimit, changePassword);

module.exports = router;
