/**
 * NEPTUNE-CXR: Database Configuration
 * Mongoose connection with retry logic and event handling.
 */
const mongoose = require('mongoose');
const config = require('./environment');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Attempting reconnect...');
    });

    return conn;
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error.message);
    console.log('[MongoDB] Retrying in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectDatabase();
  }
};

module.exports = connectDatabase;
