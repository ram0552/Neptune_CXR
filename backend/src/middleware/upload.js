/**
 * NEPTUNE-CXR: File Upload Middleware
 * Multer configuration for chest X-ray image uploads.
 */
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/environment');
const fs = require('fs');

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4().slice(0, 12);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `cxr_${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// File filter — only accept image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PNG, JPEG, and JPG are accepted.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

module.exports = upload;
