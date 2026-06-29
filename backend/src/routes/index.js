/**
 * NEPTUNE-CXR: API Routes
 * Central route mounting for all backend endpoints.
 */
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Controllers
const { analyzeImage } = require('../controllers/analyzeController');
const { getReports, getReportById, deleteReport } = require('../controllers/reportController');
const { getDashboardStats } = require('../controllers/dashboardController');

// ── Upload & Analysis ──
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

router.post('/analyze', upload.single('image'), analyzeImage);

// ── Reports ──
router.get('/reports', getReports);
router.get('/report/:id', getReportById);
router.delete('/report/:id', deleteReport);

// ── Dashboard ──
router.get('/dashboard', getDashboardStats);

// ── Health Check ──
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'NEPTUNE-CXR Backend',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
