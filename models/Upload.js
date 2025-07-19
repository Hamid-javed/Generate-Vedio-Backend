const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['photo', 'letter', 'video', 'audio']
  },
  uploadedBy: {
    type: String, // Could be user ID or session ID
    required: false
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // For videos/audio
    format: String
  },
  // Photo editing information
  editSettings: {
    crop: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: Number,
      height: Number
    },
    zoom: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 3
    },
    rotation: {
      type: Number,
      default: 0
    },
    brightness: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2
    },
    contrast: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2
    }
  },
  processed: {
    type: Boolean,
    default: false
  },
  processedPath: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Upload', uploadSchema);
