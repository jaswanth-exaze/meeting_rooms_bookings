const express = require("express");
const { getRooms, getRoomById, getRoomSchedule } = require("../controllers/room.controller");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", getRooms);
router.get("/:roomId/schedule", requireAuth, getRoomSchedule);
router.get("/:roomId", getRoomById);

module.exports = router;
