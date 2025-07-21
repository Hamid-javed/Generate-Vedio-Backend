const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const videoGenerationController = require('../controllers/videoGenerationController');

// Voice generation endpoint
router.post('/generate-voice', voiceController.generateNameVoice);

// Video generation endpoint
router.post('/generate-video', videoGenerationController.createVideo);

module.exports = router;
