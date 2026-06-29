/**
 * NEPTUNE-CXR: Express Application Setup
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/environment');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ── Static File Serving ──
// Serve uploaded images
app.use('/uploads', express.static(config.uploadDir));
// Serve GradCAM heatmaps
app.use('/heatmaps', express.static(config.heatmapDir));

// ── API Routes ──
app.use('/api', routes);

// ── Root endpoint ──
app.get('/', (req, res) => {
  res.json({
    service: 'NEPTUNE-CXR Backend API',
    version: '1.0.0',
    description: 'Trustworthy Multi-Label Thoracic Disease Screening System',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze',
      reports: 'GET /api/reports',
      report: 'GET /api/report/:id',
      dashboard: 'GET /api/dashboard'
    }
  });
});

// ── Error Handling ──
app.use(errorHandler);

module.exports = app;
