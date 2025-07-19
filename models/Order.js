const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  childName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  photos: [{
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    processedPath: String,
    originalPath: String
  }],
  customScript: {
    scriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomScript'
    },
    fullScript: String
  },
  letterUpload: {
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    },
    processedPath: String
  },
  voiceSettings: {
    voice: {
      type: String,
      default: 'santa_voice'
    },
    voiceoverPath: String
  },
  goodbyeMessage: String,
  paymentIntentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'processing', 'completed', 'failed'],
    default: 'created'
  },
  videoPath: String,
  downloadUrl: String,
  progress: {
    type: Number,
    default: 0
  },
  errorMessage: String,
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from creation
  }
}, {
  timestamps: true
});

// Index for automatic deletion of expired orders
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', orderSchema);
