const { ScriptSegment, GoodbyeMessage, CustomScript } = require('../models/Script');

class ScriptService {
  async getAllSegments() {
    try {
      const segments = await ScriptSegment.find({ isActive: true });
      return segments;
    } catch (error) {
      console.error('Error fetching script segments:', error);
      throw new Error('Failed to fetch script segments');
    }
  }

  async getGoodbyeMessages() {
    try {
      const messages = await GoodbyeMessage.find({ isActive: true });
      return messages;
    } catch (error) {
      console.error('Error fetching goodbye messages:', error);
      throw new Error('Failed to fetch goodbye messages');
    }
  }

  async createCustomScript({ segmentIds, goodbyeMessageId, childName, userId }) {
    try {
      const segments = await ScriptSegment.find({ 
        id: { $in: segmentIds }, 
        isActive: true 
      });
      
      const goodbyeMessage = await GoodbyeMessage.findOne({ 
        id: goodbyeMessageId, 
        isActive: true 
      });

      if (segments.length === 0) {
        throw new Error('No valid segments found');
      }

      // Combine segments into a full script
      let fullScript = `Ho ho ho! Hello there, ${childName}!\n\n`;

      segments.forEach((segment) => {
        fullScript += segment.text.replace(/{name}/g, childName) + '\n\n';
      });

      if (goodbyeMessage) {
        fullScript += goodbyeMessage.text.replace(/{name}/g, childName);
      }

      const estimatedDuration = this.calculateDuration(fullScript);

      const customScript = new CustomScript({
        childName,
        segmentIds,
        goodbyeMessageId,
        fullScript,
        estimatedDuration,
        userId
      });

      await customScript.save();

      return {
        id: customScript._id,
        childName,
        segments,
        goodbyeMessage,
        fullScript,
        estimatedDuration,
      };
    } catch (error) {
      console.error('Error creating custom script:', error);
      throw new Error('Failed to create custom script');
    }
  }

  calculateDuration(text) {
    // Rough estimation: 150 words per minute
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / 150) * 60);
  }

  async initializeDefaultScripts() {
    try {
      // Check if segments already exist
      const existingSegments = await ScriptSegment.countDocuments();
      const existingMessages = await GoodbyeMessage.countDocuments();

      if (existingSegments === 0) {
        const defaultSegments = [
          {
            id: 'good-behavior',
            title: 'Good Behavior Praise',
            text: "I've been watching you all year, {name}, and I'm so proud of how good you've been! You've been kind to others, helped your family, and tried your best in everything you do.",
            duration: 15,
            category: 'praise'
          },
          {
            id: 'christmas-spirit',
            title: 'Christmas Spirit',
            text: 'The Christmas spirit shines so brightly in you, {name}! Your kindness and joy make the whole world a little more magical. That\'s exactly what Christmas is all about!',
            duration: 12,
            category: 'inspiration'
          },
          {
            id: 'special-gift',
            title: 'Special Gift Mention',
            text: 'I have something very special planned for you this Christmas, {name}. The elves and I have been working extra hard to make sure it\'s perfect just for you!',
            duration: 10,
            category: 'gifts'
          },
          {
            id: 'keep-believing',
            title: 'Keep Believing',
            text: 'Remember, {name}, the magic of Christmas lives in your heart. Keep believing, keep being kind, and keep spreading joy wherever you go!',
            duration: 13,
            category: 'inspiration'
          },
          {
            id: 'family-love',
            title: 'Family Love',
            text: 'I can see how much love you have for your family, {name}, and how much they love you too. That love is the greatest gift of all!',
            duration: 11,
            category: 'family'
          },
          {
            id: 'school-achievement',
            title: 'School Achievement',
            text: 'I heard from the elves that you\'ve been working so hard at school, {name}! Learning new things and being curious about the world makes Santa very happy!',
            duration: 12,
            category: 'achievement'
          },
          {
            id: 'helping-others',
            title: 'Helping Others',
            text: 'What makes me most proud, {name}, is how you help others and share your toys. That generous heart of yours is what makes Christmas truly special!',
            duration: 14,
            category: 'kindness'
          }
        ];

        await ScriptSegment.insertMany(defaultSegments);
        console.log('Default script segments initialized');
      }

      if (existingMessages === 0) {
        const defaultMessages = [
          {
            id: 'classic-goodbye',
            title: 'Classic Santa Goodbye',
            text: 'Ho ho ho! Merry Christmas, {name}! Be good, and I\'ll see you next year!',
            duration: 8
          },
          {
            id: 'magical-goodbye',
            title: 'Magical Goodbye',
            text: 'The magic of Christmas will always be with you, {name}. Until we meet again, keep the Christmas spirit alive in your heart! Ho ho ho!',
            duration: 12
          },
          {
            id: 'adventure-goodbye',
            title: 'Adventure Goodbye',
            text: 'What an amazing adventure we\'ve had together, {name}! Remember, every day can be as magical as Christmas if you believe! Ho ho ho!',
            duration: 10
          },
          {
            id: 'warm-goodbye',
            title: 'Warm Goodbye',
            text: 'Give your family a big hug from Santa, {name}! I\'ll be thinking of you on Christmas morning. Ho ho ho! Merry Christmas!',
            duration: 9
          }
        ];

        await GoodbyeMessage.insertMany(defaultMessages);
        console.log('Default goodbye messages initialized');
      }
    } catch (error) {
      console.error('Error initializing default scripts:', error);
    }
  }

  async getCustomScript(scriptId) {
    try {
      const customScript = await CustomScript.findById(scriptId)
        .populate('segmentIds')
        .populate('goodbyeMessageId');
      return customScript;
    } catch (error) {
      console.error('Error fetching custom script:', error);
      throw new Error('Failed to fetch custom script');
    }
  }
}

module.exports = new ScriptService();
