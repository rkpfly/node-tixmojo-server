/**
 * Enhanced Logger Module
 * Provides both middleware and utility logging functions
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Format log message
const formatLogMessage = (level, message) => {
  return `[${new Date().toISOString()}] [${level}] ${message}`;
};

// Log to console with appropriate formatting
const log = (level, message) => {
  const formattedMessage = formatLogMessage(level, message);
  
  switch(level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(formattedMessage);
      break;
    case LOG_LEVELS.INFO:
    default:
      console.log(formattedMessage);
  }
};

// Logger utility methods
const logger = {
  error: (message) => log(LOG_LEVELS.ERROR, message),
  warn: (message) => log(LOG_LEVELS.WARN, message),
  info: (message) => log(LOG_LEVELS.INFO, message),
  debug: (message) => log(LOG_LEVELS.DEBUG, message),
};

/**
 * Request logger middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = new Date();
  
  // Log request
  logger.info(`${req.method} ${req.originalUrl} - Request received`);
  
  // Once the response is sent
  res.on('finish', () => {
    const duration = new Date() - start;
    const status = res.statusCode;
    const level = status >= 500 ? LOG_LEVELS.ERROR : 
                 status >= 400 ? LOG_LEVELS.WARN : 
                 LOG_LEVELS.INFO;
    
    log(level, `${req.method} ${req.originalUrl} ${status} ${duration}ms`);
  });
  
  next();
};

// Export both the middleware and the utility logger
module.exports = requestLogger;
module.exports.logger = logger;