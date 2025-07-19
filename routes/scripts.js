const express = require("express");
const router = express.Router();
const scriptService = require("../services/scriptService");

// Get all available script segments
router.get("/segments", async (req, res) => {
  try {
    const segments = await scriptService.getAllSegments();
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get goodbye messages
router.get("/goodbye", async (req, res) => {
  try {
    const messages = await scriptService.getGoodbyeMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom script from selected segments
router.post("/create", async (req, res) => {
  try {
    const { segmentIds, goodbyeMessageId, childName, userId } = req.body;

    if (!segmentIds || !Array.isArray(segmentIds) || segmentIds.length === 0) {
      return res.status(400).json({ error: "At least one segment must be selected" });
    }

    const customScript = await scriptService.createCustomScript({
      segmentIds,
      goodbyeMessageId,
      childName,
      userId
    });

    res.json({
      success: true,
      script: customScript,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get custom script by ID
router.get("/custom/:scriptId", async (req, res) => {
  try {
    const { scriptId } = req.params;
    const customScript = await scriptService.getCustomScript(scriptId);
    
    if (!customScript) {
      return res.status(404).json({ error: "Custom script not found" });
    }

    res.json({
      success: true,
      script: customScript,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
