const express = require("express");
const router = express.Router();
const voiceService = require("../services/voiceService");
const Joi = require("joi");

const nameSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  voice: Joi.string().optional().default("santa_voice"),
});

// Generate voice preview for child's name
router.post("/preview", async (req, res) => {
  try {
    const { error, value } = nameSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, voice } = value;
    const audioUrl = await voiceService.generateNamePreview(name, voice);

    res.json({
      success: true,
      audioUrl,
      name,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate full voiceover for video
router.post("/generate", async (req, res) => {
  try {
    const { name, script, voice = "santa_voice" } = req.body;

    if (!name || !script) {
      return res.status(400).json({ error: "Name and script are required" });
    }

    const audioUrl = await voiceService.generateFullVoiceover(name, script, voice);

    res.json({
      success: true,
      audioUrl,
      duration: await voiceService.getAudioDuration(audioUrl),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available voices
router.get("/voices", async (req, res) => {
  try {
    const voices = await voiceService.getAvailableVoices();

    res.json({
      success: true,
      voices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete audio file
router.delete("/audio/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const audioPath = `/uploads/audio/${filename}`;
    
    await voiceService.deleteAudioFile(audioPath);

    res.json({
      success: true,
      message: "Audio file deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
