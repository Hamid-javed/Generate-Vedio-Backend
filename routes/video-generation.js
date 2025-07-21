const express = require("express");
const router = express.Router();
const videoGenerationController = require("../controllers/videoGenerationController");

// Single endpoint to create video with all user data
router.post("/create", videoGenerationController.createVideo);

module.exports = router;
