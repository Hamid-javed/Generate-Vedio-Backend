const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");

// Generate voice preview for child's name
router.post("/preview", voiceController.preview);

// Generate full voiceover for video
router.post("/generate", voiceController.generate);

// Get available voices
router.get("/voices", voiceController.getVoices);

// Delete audio file
router.delete("/audio/:filename", voiceController.deleteAudio);

module.exports = router;
