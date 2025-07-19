const express = require("express");
const router = express.Router();
const scriptsController = require("../controllers/scriptsController");

// Get all available script segments
router.get("/segments", scriptsController.getSegments);

// Get goodbye messages
router.get("/goodbye", scriptsController.getGoodbyeMessages);

// Create custom script from selected segments
router.post("/create", scriptsController.create);

// Get custom script by ID
router.get("/custom/:scriptId", scriptsController.getCustomScript);

module.exports = router;
