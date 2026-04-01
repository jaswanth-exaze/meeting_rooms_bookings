// Register admin API endpoints and middleware.

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/rolecheck");
const { listEmployees, createEmployee, deleteEmployee, listRooms, createRoom } = require("../controllers/admin.controller");

// Create the router for this resource.
const router = express.Router();

// Attach middleware and controller handlers to each route.
router.use(requireAuth, requireAdmin);
router.get("/employees", listEmployees);
router.post("/employees", createEmployee);
router.delete("/employees/:employeeId", deleteEmployee);
router.get("/rooms", listRooms);
router.post("/rooms", createRoom);

module.exports = router;
