const express = require("express");
const { getLocations } = require("../controllers/location.controller");

const router = express.Router();

router.get("/", getLocations);

module.exports = router;
