const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/rolecheck");
const { listEmployees, createEmployee, deleteEmployee } = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/employees", listEmployees);
router.post("/employees", createEmployee);
router.delete("/employees/:employeeId", deleteEmployee);

module.exports = router;
