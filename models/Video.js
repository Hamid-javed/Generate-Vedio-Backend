const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  userPhotos: [{
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      rotation: { type: Number, default: 0 }
    }
  }],
  userTexts: [{
    content: String,
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    style: {
      fontSize: Number,
      color: String,
      fontFamily: String
    }
  }],
  voiceSettings: {
    voice: String,
    speed: { type: Number, default: 1 },
    pitch: { type: Number, default: 1 }
  },
  script: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  outputPath: String,
  downloadUrl: String,
  duration: Number,
  fileSize: Number,
  userId: String, // Could be session ID or user ID
  email: String, // For sending the video
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from creation
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired videos
videoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Video', videoSchema);
