const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { searchEmployees } = require("../controllers/employee.controller");

const router = express.Router();

router.use(requireAuth);
router.get("/search", searchEmployees);

module.exports = router;
