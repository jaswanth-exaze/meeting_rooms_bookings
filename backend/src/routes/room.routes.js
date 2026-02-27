const express = require("express");
const { getRooms, getRoomById } = require("../controllers/room.controller");

const router = express.Router();

router.get("/", getRooms);
router.get("/:roomId", getRoomById);

module.exports = router;
