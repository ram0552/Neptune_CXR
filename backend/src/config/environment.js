/**
 * NEPTUNE-CXR: Environment Configuration
 * Centralized environment variable management with defaults.
 */
require('dotenv').config();
const path = require('path');

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/neptune-cxr',

  // Python AI Service
  pythonApiUrl: process.env.PYTHON_API_URL || 'http://localhost:8000',

  // File Directories
  uploadDir: path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || '../uploads'),
  heatmapDir: path.resolve(__dirname, '..', '..', process.env.HEATMAP_DIR || '../heatmaps'),

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
};

module.exports = config;
