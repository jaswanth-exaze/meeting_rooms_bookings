// Register employee API endpoints and middleware.

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { searchEmployees } = require("../controllers/employee.controller");

// Create the router for this resource.
const router = express.Router();

// Attach middleware and controller handlers to each route.
router.use(requireAuth);
router.get("/search", searchEmployees);

module.exports = router;
