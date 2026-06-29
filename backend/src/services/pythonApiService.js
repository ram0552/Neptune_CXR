/**
 * NEPTUNE-CXR: Python AI API Client Service
 * Handles communication with the Python FastAPI AI service.
 * Node.js performs NO AI processing — only orchestration.
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

class PythonApiService {
  constructor() {
    this.baseUrl = config.pythonApiUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 120000, // 2 minutes — model inference can be slow
    });
  }

  /**
   * Send an image to the Python AI service for analysis.
   * @param {string} imagePath - Absolute path to the uploaded image
   * @returns {Promise<Object>} Prediction response from Python service
   */
  async analyzeImage(imagePath) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(imagePath), {
        filename: path.basename(imagePath),
        contentType: this._getMimeType(imagePath)
      });

      const response = await this.client.post('/predict', form, {
        headers: {
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Python AI service error: ${error.response.data.detail || error.response.statusText}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Python AI service is not running. Please start it on port 8000.');
      } else {
        throw new Error(`Failed to communicate with AI service: ${error.message}`);
      }
    }
  }

  /**
   * Check if the Python AI service is healthy.
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      return {
        status: 'unavailable',
        model_loaded: false,
        error: error.message
      };
    }
  }

  _getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

module.exports = new PythonApiService();
