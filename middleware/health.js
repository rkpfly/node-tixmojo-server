/**
 * Health check middleware
 * Provides the health check endpoint for monitoring and Railway deployment
 */

const { checkDatabaseConnection } = require('../utils/db');
const { sendSuccess, sendError } = require('../utils/responseUtils');

/**
 * Health check handler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseConnection();
    
    // Get MongoDB URI (masked for security)
    const mongoUriMasked = process.env.MONGODB_URI 
      ? `${process.env.MONGODB_URI.split('@')[0].substr(0, 10)}...@${process.env.MONGODB_URI.split('@')[1]?.split('/')[0] || 'unknown'}`
      : 'Not configured';
    
    // Prepare response with system health information
    const health = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        uri: mongoUriMasked
      },
      version: process.env.API_VERSION || '1.0.0',
      platform: process.platform,
      node: process.version
    };
    
    // Set appropriate status code based on health
    const statusCode = dbHealthy ? 200 : 503;
    
    // Return health information
    return res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return sendError(res, 500, 'Health check failed', error);
  }
};

module.exports = {
  healthCheck
};