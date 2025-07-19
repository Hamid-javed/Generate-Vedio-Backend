const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

// Get all available video templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific template details
router.get("/:templateId", async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
