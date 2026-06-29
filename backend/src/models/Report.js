/**
 * NEPTUNE-CXR: Report Model
 * Stores complete screening reports including predictions, heatmaps, and clinical summaries.
 */
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  disease: { type: String, required: true },
  probability: { type: Number, required: true, min: 0, max: 1 },
  confidence_level: { type: String, required: true },
  risk_level: { type: String, required: true },
  is_positive: { type: Boolean, required: true },
  affected_region: { type: String, default: '' },
  explanation: { type: String, default: '' }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  // Image info
  imageFilename: { type: String, required: true },
  originalFilename: { type: String, required: true },
  imagePath: { type: String, required: true },

  // AI predictions
  predictions: [predictionSchema],
  positiveFindings: [{ type: String }],
  topFinding: { type: String, default: 'No Finding' },

  // Heatmap
  heatmapFilename: { type: String, default: null },

  // Clinical report
  clinicalSummary: { type: String, default: '' },
  suggestedFollowUp: { type: String, default: '' },
  aiDisclaimer: {
    type: String,
    default: 'This AI-generated screening result is for research and educational purposes only. '
           + 'It does not constitute a medical diagnosis. Clinical correlation and radiologist '
           + 'review are strongly recommended before any clinical decision-making.'
  },

  // Model info
  inferenceTimeMs: { type: Number, default: 0 },
  modelVersion: { type: String, default: '' },
  modelName: { type: String, default: '' },

  // Image metadata
  imageMetadata: {
    original_width: Number,
    original_height: Number,
    format: String,
    mode: String
  },

  // Status
  reportStatus: {
    type: String,
    enum: ['pending', 'completed', 'reviewed', 'archived'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reportStatus: 1 });
reportSchema.index({ topFinding: 1 });
reportSchema.index({ 'predictions.disease': 1 });

module.exports = mongoose.model('Report', reportSchema);
