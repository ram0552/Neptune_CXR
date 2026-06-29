/**
 * NEPTUNE-CXR: ModelMetadata Model
 * Tracks AI model versions deployed and their configurations.
 */
const mongoose = require('mongoose');

const modelMetadataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  architecture: { type: String, default: '' },
  numClasses: { type: Number, default: 14 },
  inputSize: { type: String, default: '224x224' },
  pretrainedOn: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  deployedAt: { type: Date, default: Date.now },
  totalPredictions: { type: Number, default: 0 },
  avgInferenceTimeMs: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('ModelMetadata', modelMetadataSchema);
