const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/error');
const Logger = require('../utils/logger');

/**
 * Middleware to protect routes with JWT authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protectRoute = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || 'tixmojo-fallback-secret-key-do-not-use-in-production'
      );

      // Add user ID to request object for use in route handlers
      req.userId = decodedToken.id;

      // Continue to the protected route
      next();
    } catch (error) {
      Logger.error(`Authentication error: ${error.message}`);
      
      if (error.name === 'TokenExpiredError') {
        return next(UnauthorizedError('Your session has expired. Please log in again.'));
      }
      
      return next(UnauthorizedError('Not authorized, invalid token'));
    }
  } else {
    // No token provided
    return next(UnauthorizedError('Not authorized, no token provided'));
  }
};

/**
 * Middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  // This would usually check user role from database or token
  // For now, we'll just stub it to check a role in the token
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(ForbiddenError('Access denied: Admin role required'));
  }
};

/**
 * Middleware to check if user has organizer role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireOrganizer = (req, res, next) => {
  // This would check if the user is an organizer
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'admin')) {
    next();
  } else {
    next(ForbiddenError('Access denied: Organizer role required'));
  }
};

module.exports = {
  protectRoute,
  requireAdmin,
  requireOrganizer
};