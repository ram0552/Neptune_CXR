/**
 * NEPTUNE-CXR: Statistics Service
 * MongoDB aggregation queries for dashboard analytics.
 */
const Report = require('../models/Report');

class StatisticsService {
  /**
   * Get comprehensive dashboard statistics.
   */
  async getDashboardStats() {
    const [
      totalReports,
      diseaseDistribution,
      avgConfidence,
      avgInferenceTime,
      dailyUploads,
      recentReports,
      riskDistribution
    ] = await Promise.all([
      this.getTotalReports(),
      this.getDiseaseDistribution(),
      this.getAverageConfidence(),
      this.getAverageInferenceTime(),
      this.getDailyUploads(),
      this.getRecentReports(5),
      this.getRiskDistribution()
    ]);

    return {
      totalReports,
      diseaseDistribution,
      avgConfidence,
      avgInferenceTime,
      dailyUploads,
      recentReports,
      riskDistribution,
      generatedAt: new Date().toISOString()
    };
  }

  async getTotalReports() {
    return Report.countDocuments({ reportStatus: { $ne: 'archived' } });
  }

  /**
   * Count occurrences of each disease across all reports.
   */
  async getDiseaseDistribution() {
    const result = await Report.aggregate([
      { $match: { reportStatus: { $ne: 'archived' } } },
      { $unwind: '$predictions' },
      { $match: { 'predictions.is_positive': true } },
      {
        $group: {
          _id: '$predictions.disease',
          count: { $sum: 1 },
          avgProbability: { $avg: '$predictions.probability' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          disease: '$_id',
          count: 1,
          avgProbability: { $round: ['$avgProbability', 4] },
          _id: 0
        }
      }
    ]);
    return result;
  }

  /**
   * Average confidence across all positive predictions.
   */
  async getAverageConfidence() {
    const result = await Report.aggregate([
      { $match: { reportStatus: { $ne: 'archived' } } },
      { $unwind: '$predictions' },
      { $match: { 'predictions.is_positive': true } },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$predictions.probability' }
        }
      }
    ]);
    return result.length > 0 ? Math.round(result[0].avgConfidence * 10000) / 100 : 0;
  }

  async getAverageInferenceTime() {
    const result = await Report.aggregate([
      { $match: { reportStatus: { $ne: 'archived' } } },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$inferenceTimeMs' }
        }
      }
    ]);
    return result.length > 0 ? Math.round(result[0].avgTime * 100) / 100 : 0;
  }

  /**
   * Daily upload counts for the last 30 days.
   */
  async getDailyUploads() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Report.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    return result;
  }

  async getRecentReports(limit = 5) {
    return Report.find({ reportStatus: { $ne: 'archived' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('originalFilename topFinding inferenceTimeMs createdAt reportStatus')
      .lean();
  }

  /**
   * Distribution of risk levels across all positive predictions.
   */
  async getRiskDistribution() {
    const result = await Report.aggregate([
      { $match: { reportStatus: { $ne: 'archived' } } },
      { $unwind: '$predictions' },
      { $match: { 'predictions.is_positive': true } },
      {
        $group: {
          _id: '$predictions.risk_level',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          level: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    return result;
  }
}

module.exports = new StatisticsService();
