/**
 * NEPTUNE-CXR: Dashboard Controller
 * Aggregated statistics for the visualization dashboard.
 */
const statisticsService = require('../services/statisticsService');
const pythonApiService = require('../services/pythonApiService');

/**
 * GET /api/dashboard
 * Get comprehensive dashboard statistics.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await statisticsService.getDashboardStats();
    
    // Also check Python AI service health
    const aiHealth = await pythonApiService.checkHealth();
    stats.aiServiceStatus = aiHealth;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
