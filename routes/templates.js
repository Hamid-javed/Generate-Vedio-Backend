const express = require("express");
const router = express.Router();
const templatesController = require("../controllers/templatesController");

// Get all available video templates
router.get("/", templatesController.getAll);

// Get specific template details
router.get("/:templateId", templatesController.getById);

module.exports = router;
