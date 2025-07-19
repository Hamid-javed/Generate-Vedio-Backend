const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Template = require('../models/Template');
const emailService = require('./emailService');

class VideoService {
  constructor() {
    this.outputDir = path.join(__dirname, '../uploads/videos');
    this.assetsDir = path.join(__dirname, '../assets/video-clips');
  }

  async generateVideo({ orderId, paymentIntentId }) {
    try {
      // Update order status
      await Order.findOneAndUpdate(
        { orderId },
        { 
          status: 'processing',
          progress: 0
        }
      );

      // Load order data from database
      const orderData = await this.getOrderData(orderId);
      if (!orderData) {
        throw new Error('Order not found');
      }

      const outputPath = path.join(this.outputDir, `${orderId}.mp4`);

      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Generate video using FFmpeg
      await this.compileVideo(orderData, outputPath);

      // Update order with completion
      await Order.findOneAndUpdate(
        { orderId },
        { 
          status: 'completed',
          progress: 100,
          videoPath: outputPath,
          downloadUrl: `/api/video/download/${orderId}`,
          completedAt: new Date()
        }
      );

      // Send email with download link
      await emailService.sendVideoReadyEmail(orderData.email, orderId);

      return { success: true, orderId };
    } catch (error) {
      console.error('Video generation error:', error);
      
      // Update order with error
      await Order.findOneAndUpdate(
        { orderId },
        { 
          status: 'failed',
          errorMessage: error.message
        }
      );
      
      throw error;
    }
  }

  async compileVideo(orderData, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        const { templateId, childName, photos, voiceSettings, customScript } = orderData;

        // Get template details
        const template = await Template.findById(templateId);
        if (!template) {
          throw new Error('Template not found');
        }

        let command = ffmpeg();

        // Add background video (mock for now)
        const backgroundVideo = path.join(this.assetsDir, 'background.mp4');
        command = command.input(backgroundVideo);

        // Add voiceover audio if available
        if (voiceSettings?.voiceoverPath) {
          const audioPath = path.join(__dirname, '..', voiceSettings.voiceoverPath);
          command = command.input(audioPath);
        }

        // Add photos as inputs if available
        if (photos && photos.length > 0) {
          photos.forEach((photo, index) => {
            if (photo.processedPath) {
              const photoPath = path.join(__dirname, '..', photo.processedPath);
              command = command.input(photoPath);
            }
          });
        }

        // Complex filter for compositing
        const filterComplex = [];
        let videoStream = '[0:v]';

        // Add photo overlays
        if (photos && photos.length > 0) {
          photos.forEach((photo, index) => {
            const inputIndex = index + (voiceSettings?.voiceoverPath ? 2 : 1);
            const outputStream = `[photo${index}]`;
            
            // Scale and overlay photo
            filterComplex.push(
              `[${inputIndex}:v]scale=300:400[scaled${index}]`
            );
            filterComplex.push(
              `${videoStream}[scaled${index}]overlay=100:100:enable='between(t,10,30)'${outputStream}`
            );
            
            videoStream = outputStream;
          });
        }

        // Add text overlay for child's name
        const textOverlay = `${videoStream}drawtext=text='${childName}':fontfile=Arial:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,5,10)'[final]`;
        filterComplex.push(textOverlay);

        command
          .complexFilter(filterComplex)
          .outputOptions([
            '-map', '[final]',
            '-map', voiceSettings?.voiceoverPath ? '1:a' : '0:a',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-preset', 'medium',
            '-crf', '23',
            '-t', '60' // Limit to 60 seconds for demo
          ])
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('FFmpeg process started:', commandLine);
          })
          .on('progress', async (progress) => {
            console.log('Processing: ' + progress.percent + '% done');
            await this.updateProgress(orderData.orderId, progress.percent);
          })
          .on('end', () => {
            console.log('Video generation completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateProgress(orderId, percent) {
    try {
      await Order.findOneAndUpdate(
        { orderId },
        { progress: Math.round(percent) }
      );
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  async getGenerationStatus(orderId) {
    try {
      const order = await Order.findOne({ orderId })
        .populate('templateId')
        .populate('photos.uploadId');
      
      if (!order) {
        return { status: 'not_found' };
      }

      return {
        status: order.status,
        progress: order.progress,
        orderId: order.orderId,
        childName: order.childName,
        templateName: order.templateId?.name,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        downloadUrl: order.downloadUrl,
        errorMessage: order.errorMessage
      };
    } catch (error) {
      console.error('Error getting generation status:', error);
      throw new Error('Failed to get generation status');
    }
  }

  async getVideoPath(orderId) {
    try {
      const order = await Order.findOne({ orderId });
      if (order && order.status === 'completed' && order.videoPath) {
        // Check if file exists
        try {
          await fs.access(order.videoPath);
          return order.videoPath;
        } catch {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting video path:', error);
      return null;
    }
  }

  async regenerateVideo(orderId) {
    try {
      // Reset order status
      await Order.findOneAndUpdate(
        { orderId },
        { 
          status: 'created',
          progress: 0,
          errorMessage: null,
          completedAt: null
        }
      );

      const order = await Order.findOne({ orderId });
      return this.generateVideo({ 
        orderId, 
        paymentIntentId: order.paymentIntentId 
      });
    } catch (error) {
      console.error('Error regenerating video:', error);
      throw new Error('Failed to regenerate video');
    }
  }

  async getOrderData(orderId) {
    try {
      const order = await Order.findOne({ orderId })
        .populate('templateId')
        .populate('photos.uploadId')
        .populate('customScript.scriptId');
      
      return order;
    } catch (error) {
      console.error('Error getting order data:', error);
      return null;
    }
  }

  async createMockVideo(orderId) {
    try {
      const outputPath = path.join(this.outputDir, `${orderId}.mp4`);
      
      // Ensure directory exists
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // Create a small mock video file for development
      const mockVideoBuffer = Buffer.alloc(1024 * 100, 0); // 100KB mock file
      await fs.writeFile(outputPath, mockVideoBuffer);
      
      return outputPath;
    } catch (error) {
      console.error('Error creating mock video:', error);
      throw new Error('Failed to create mock video');
    }
  }

  async deleteVideo(orderId) {
    try {
      const order = await Order.findOne({ orderId });
      if (order && order.videoPath) {
        await fs.unlink(order.videoPath);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }
}

module.exports = new VideoService();
