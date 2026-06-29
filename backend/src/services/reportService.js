/**
 * NEPTUNE-CXR: Report Generation Service
 * Builds structured clinical screening reports from AI predictions.
 */
const Report = require('../models/Report');

class ReportService {
  /**
   * Create a complete screening report from upload data and AI predictions.
   */
  async createReport(imageInfo, predictionData) {
    const positiveFindings = predictionData.predictions
      .filter(p => p.is_positive)
      .sort((a, b) => b.probability - a.probability);

    const clinicalSummary = this.generateClinicalSummary(positiveFindings);
    const suggestedFollowUp = this.generateFollowUp(positiveFindings);

    const report = new Report({
      imageFilename: imageInfo.filename,
      originalFilename: imageInfo.originalname,
      imagePath: imageInfo.path,
      predictions: predictionData.predictions,
      positiveFindings: predictionData.positive_findings || [],
      topFinding: predictionData.top_finding || 'No Finding',
      heatmapFilename: predictionData.heatmap_filename || null,
      clinicalSummary,
      suggestedFollowUp,
      inferenceTimeMs: predictionData.inference_time_ms,
      modelVersion: predictionData.model_version,
      modelName: predictionData.model_name,
      imageMetadata: predictionData.image_metadata,
      reportStatus: 'completed'
    });

    await report.save();
    return report;
  }

  /**
   * Generate a clinical summary from positive findings.
   */
  generateClinicalSummary(positiveFindings) {
    if (!positiveFindings || positiveFindings.length === 0) {
      return 'AI screening analysis complete. No significant thoracic abnormalities detected. '
           + 'The chest X-ray appears within normal limits based on automated analysis. '
           + 'Clinical correlation is recommended.';
    }

    const count = positiveFindings.length;
    const diseases = positiveFindings.map(f => f.disease);

    let summary = `AI screening identified ${count} finding${count > 1 ? 's' : ''}: `;
    summary += diseases.join(', ') + '. ';

    // Add details for high-confidence findings
    const highConf = positiveFindings.filter(f => f.probability >= 0.7);
    if (highConf.length > 0) {
      summary += `High-confidence findings: ${highConf.map(f => 
        `${f.disease} (${(f.probability * 100).toFixed(1)}%)`
      ).join(', ')}. `;
    }

    // Add region information
    const regions = [...new Set(positiveFindings.map(f => f.affected_region).filter(Boolean))];
    if (regions.length > 0) {
      summary += `Primary areas of concern: ${regions.join(', ')}. `;
    }

    summary += 'Radiologist review recommended for clinical correlation.';
    return summary;
  }

  /**
   * Generate suggested follow-up actions based on findings.
   */
  generateFollowUp(positiveFindings) {
    if (!positiveFindings || positiveFindings.length === 0) {
      return 'No immediate follow-up required based on AI screening. '
           + 'Routine follow-up as clinically indicated.';
    }

    const followUps = [];
    
    const hasCritical = positiveFindings.some(f => f.risk_level === 'Critical');
    const hasHigh = positiveFindings.some(f => f.risk_level === 'High');

    if (hasCritical) {
      followUps.push('URGENT: Critical finding detected. Immediate radiologist review recommended.');
    }
    if (hasHigh) {
      followUps.push('Priority radiologist consultation recommended for high-risk findings.');
    }

    // Disease-specific follow-up
    const diseaseNames = positiveFindings.map(f => f.disease);
    if (diseaseNames.includes('Pneumothorax')) {
      followUps.push('Consider CT chest for pneumothorax evaluation and sizing.');
    }
    if (diseaseNames.includes('Mass') || diseaseNames.includes('Nodule')) {
      followUps.push('Consider CT chest for further characterization of pulmonary mass/nodule. Follow Fleischner Society guidelines if applicable.');
    }
    if (diseaseNames.includes('Pneumonia')) {
      followUps.push('Clinical correlation with symptoms, lab values (CBC, CRP). Consider follow-up imaging in 4-6 weeks.');
    }
    if (diseaseNames.includes('Effusion')) {
      followUps.push('Consider lateral decubitus or ultrasound for pleural effusion characterization.');
    }
    if (diseaseNames.includes('Cardiomegaly')) {
      followUps.push('Recommend echocardiogram for cardiac evaluation.');
    }

    if (followUps.length === 0) {
      followUps.push('Radiologist review recommended. Follow-up imaging as clinically indicated.');
    }

    return followUps.join(' ');
  }
}

module.exports = new ReportService();
