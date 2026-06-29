/**
 * NEPTUNE-CXR: Report Controller
 * CRUD operations for screening reports.
 */
const Report = require('../models/Report');

/**
 * GET /api/reports
 * List reports with pagination, search, filter, and sort.
 */
const getReports = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      disease = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { reportStatus: { $ne: 'archived' } };

    if (search) {
      filter.originalFilename = { $regex: search, $options: 'i' };
    }
    if (disease) {
      filter.positiveFindings = disease;
    }
    if (status) {
      filter.reportStatus = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/report/:id
 * Get a single report by ID.
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/report/:id
 * Soft-delete (archive) a report.
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { reportStatus: 'archived' },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report archived successfully',
      data: { id: report._id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, getReportById, deleteReport };
