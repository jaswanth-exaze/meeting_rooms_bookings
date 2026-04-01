// Register room API endpoints and middleware.

const express = require("express");
const { getRooms, getRoomById, getRoomSchedule } = require("../controllers/room.controller");
const requireAuth = require("../middleware/requireAuth");

// Create the router for this resource.
const router = express.Router();

// Attach middleware and controller handlers to each route.
router.get("/", getRooms);
router.get("/:roomId/schedule", requireAuth, getRoomSchedule);
router.get("/:roomId", getRoomById);

module.exports = router;
