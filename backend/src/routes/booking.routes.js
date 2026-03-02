-- Active: 1771256090925@@127.0.0.1@3306@meeting_room_booking
const express = require("express");
const {
  getUpcomingBookings,
  getBookingSummary,
  getBookingReports,
  createBooking,
  updateBooking,
  cancelBooking
} = require("../controllers/booking.controller");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.get("/upcoming", getUpcomingBookings);
router.get("/summary", getBookingSummary);
router.get("/reports", getBookingReports);
router.post("/", createBooking);
router.patch("/:bookingId", updateBooking);
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;
