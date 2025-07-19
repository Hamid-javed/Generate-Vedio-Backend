const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['christmas', 'birthday', 'general']
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  photoSlots: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    rotation: { type: Number, default: 0 }
  }],
  textSlots: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    fontSize: Number,
    color: String,
    fontFamily: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
