/**
 * Custom request logger middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const logger = (req, res, next) => {
  const start = new Date();
  
  // Once the response is sent
  res.on('finish', () => {
    const duration = new Date() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

module.exports = logger;