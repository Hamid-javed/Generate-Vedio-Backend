const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/santa-video', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Initialize default data
  try {
    await templateService.initializeDefaultTemplates();
    await scriptService.initializeDefaultScripts();
    console.log('Default data initialized');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const templateRoutes = require('./routes/templates');
const voiceRoutes = require('./routes/voice');
const uploadRoutes = require('./routes/upload');
const scriptRoutes = require('./routes/scripts');
const paymentRoutes = require('./routes/payment');
const videoRoutes = require('./routes/video');
const orderRoutes = require('./routes/orders');
const featuresRoutes = require('./routes/features');

// Import services for initialization
const templateService = require('./services/templateService');
const scriptService = require('./services/scriptService');

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/features', featuresRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Santa Video Node.js Backend running on port ${PORT}`);
});
