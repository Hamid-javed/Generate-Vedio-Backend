const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🎅 Santa Video Backend Starting...');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const templateRoutes = require('./routes/templates');
const voiceRoutes = require('./routes/voice');
const scriptRoutes = require('./routes/scripts');
const paymentRoutes = require('./routes/payment');
const videoGenerationRoutes = require('./routes/video-generation');

// Routes
app.use('/api/templates', templateRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/video', videoGenerationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: '🎅 Santa Video Backend is running!'
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
