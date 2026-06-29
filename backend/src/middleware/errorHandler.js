/**
 * NEPTUNE-CXR: Global Error Handler
 * Structured error responses for all API errors.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      detail: 'Maximum file size is 10MB',
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      detail: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      detail: messages.join(', '),
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose cast errors (invalid ID format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      detail: `Invalid value for ${err.path}: ${err.value}`,
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
