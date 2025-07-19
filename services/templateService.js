const Template = require('../models/Template');

class TemplateService {
  async getAllTemplates() {
    try {
      const templates = await Template.find({ isActive: true });
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  async getTemplateById(templateId) {
    try {
      const template = await Template.findById(templateId);
      return template;
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      throw new Error('Failed to fetch template');
    }
  }

  async createTemplate(templateData) {
    try {
      const template = new Template(templateData);
      await template.save();
      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create template');
    }
  }

  async updateTemplate(templateId, updateData) {
    try {
      const template = await Template.findByIdAndUpdate(
        templateId, 
        updateData, 
        { new: true }
      );
      return template;
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  async deleteTemplate(templateId) {
    try {
      await Template.findByIdAndUpdate(templateId, { isActive: false });
      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  async getTemplatesByCategory(category) {
    try {
      const templates = await Template.find({ 
        category: category, 
        isActive: true 
      });
      return templates;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw new Error('Failed to fetch templates by category');
    }
  }

  async initializeDefaultTemplates() {
    try {
      const existingCount = await Template.countDocuments();
      if (existingCount > 0) {
        return; // Templates already exist
      }

      const defaultTemplates = [
        {
          name: 'Classic Santa',
          description: 'Traditional Santa video with workshop background',
          previewUrl: '/assets/templates/classic-santa-preview.mp4',
          videoUrl: '/assets/templates/classic-santa.mp4',
          thumbnail: '/assets/templates/classic-santa-thumb.jpg',
          duration: 120,
          category: 'christmas',
          isPremium: false,
          tags: ['classic', 'traditional', 'workshop'],
          photoSlots: [
            { x: 100, y: 200, width: 300, height: 400, rotation: 0 }
          ],
          textSlots: [
            { 
              x: 50, y: 50, width: 500, height: 100, 
              fontSize: 48, color: 'white', fontFamily: 'Arial'
            }
          ]
        },
        {
          name: 'North Pole Adventure',
          description: 'Santa takes you on a tour of the North Pole',
          previewUrl: '/assets/templates/north-pole-preview.mp4',
          videoUrl: '/assets/templates/north-pole.mp4',
          thumbnail: '/assets/templates/north-pole-thumb.jpg',
          duration: 150,
          category: 'christmas',
          isPremium: false,
          tags: ['adventure', 'north-pole', 'tour'],
          photoSlots: [
            { x: 150, y: 250, width: 350, height: 450, rotation: 0 }
          ],
          textSlots: [
            { 
              x: 75, y: 75, width: 550, height: 120, 
              fontSize: 52, color: '#FFD700', fontFamily: 'Arial'
            }
          ]
        },
        {
          name: 'Magical Christmas',
          description: 'Enchanted Christmas experience with special effects',
          previewUrl: '/assets/templates/magical-preview.mp4',
          videoUrl: '/assets/templates/magical.mp4',
          thumbnail: '/assets/templates/magical-thumb.jpg',
          duration: 180,
          category: 'christmas',
          isPremium: true,
          tags: ['magical', 'enchanted', 'special-effects'],
          photoSlots: [
            { x: 200, y: 300, width: 400, height: 500, rotation: 0 }
          ],
          textSlots: [
            { 
              x: 100, y: 100, width: 600, height: 140, 
              fontSize: 56, color: '#FF6B6B', fontFamily: 'Arial'
            }
          ]
        }
      ];

      await Template.insertMany(defaultTemplates);
      console.log('Default templates initialized');
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  }
}

module.exports = new TemplateService();
