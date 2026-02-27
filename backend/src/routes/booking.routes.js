const express = require("express");
const { getUpcomingBookings, getBookingSummary, createBooking } = require("../controllers/booking.controller");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.get("/upcoming", getUpcomingBookings);
router.get("/summary", getBookingSummary);
router.post("/", createBooking);

module.exports = router;
