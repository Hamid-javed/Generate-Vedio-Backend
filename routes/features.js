const express = require("express");
const router = express.Router();
const featuresController = require("../controllers/featuresController");

// Get all implemented features overview
router.get("/overview", featuresController.overview);

// Get API endpoints summary
router.get("/endpoints", featuresController.endpoints);

module.exports = router;
