/**
 * NEPTUNE-CXR: Analyze Controller
 * Handles the full screening workflow:
 * Upload → Forward to Python AI → Store Report → Return Response
 */
const path = require('path');
const pythonApiService = require('../services/pythonApiService');
const reportService = require('../services/reportService');

/**
 * POST /api/analyze
 * Upload a chest X-ray and run AI analysis.
 */
const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        detail: 'Please upload a PNG, JPEG, or JPG image.'
      });
    }

    console.log(`[Analyze] Processing: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Forward image to Python AI service
    const predictionData = await pythonApiService.analyzeImage(req.file.path);

    // Create and store the report
    const report = await reportService.createReport(req.file, predictionData);

    console.log(`[Analyze] Report created: ${report._id} | Top: ${report.topFinding} | ${report.inferenceTimeMs}ms`);

    res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        report: report
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeImage };
