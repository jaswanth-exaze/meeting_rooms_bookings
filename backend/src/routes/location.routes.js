// Register location API endpoints and middleware.

const express = require("express");
const { getLocations } = require("../controllers/location.controller");

// Create the router for this resource.
const router = express.Router();

// Attach middleware and controller handlers to each route.
router.get("/", getLocations);

module.exports = router;
