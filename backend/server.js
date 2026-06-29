/**
 * NEPTUNE-CXR: Server Entry Point
 * Connects to MongoDB and starts the Express server.
 */
require('dotenv').config();
const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const config = require('./src/config/environment');

const startServer = async () => {
  console.log('='.repeat(60));
  console.log('  NEPTUNE-CXR: Backend Server Starting');
  console.log('='.repeat(60));

  // Connect to MongoDB
  await connectDatabase();

  // Start server
  app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port}`);
    console.log(`[Server] Python AI URL: ${config.pythonApiUrl}`);
    console.log(`[Server] Upload dir: ${config.uploadDir}`);
    console.log('='.repeat(60));
    console.log(`  API ready at http://localhost:${config.port}`);
    console.log('='.repeat(60));
  });
};

startServer().catch((error) => {
  console.error('[Fatal] Failed to start server:', error.message);
  process.exit(1);
});
