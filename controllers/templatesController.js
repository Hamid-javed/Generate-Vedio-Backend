const Template = require("../models/Template");

const templatesController = {
  // Get all available video templates
  getAll: async (req, res) => {
    try {
      const templates = await Template.find();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get specific template details
  getById: async (req, res) => {
    try {
      const template = await Template.findById(req.params.templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = templatesController;
