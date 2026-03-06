const express = require("express");
const {
  getUpcomingBookings,
  getBookingSummary,
  getBookingById,
  getBookingReports,
  createBooking,
  updateBooking,
  cancelBooking,
  vacateBooking
} = require("../controllers/booking.controller");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.get("/upcoming", getUpcomingBookings);
router.get("/summary", getBookingSummary);
router.get("/reports", getBookingReports);
router.get("/:bookingId", getBookingById);
router.post("/", createBooking);
router.patch("/:bookingId", updateBooking);
router.patch("/:bookingId/cancel", cancelBooking);
router.patch("/:bookingId/vacate", vacateBooking);

module.exports = router;
