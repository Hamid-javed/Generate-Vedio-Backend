const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");

// Generate voice for child's name using ElevenLabs
router.post("/sample-voice", voiceController.generateNameVoice);

module.exports = router;
