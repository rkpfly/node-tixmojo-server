const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for different purposes
 * @param {string} id - User ID to include in the token
 * @param {string} option - Token type/purpose: 'access', 'refresh', 'email', 'forgot-password', 'login'
 * @returns {string} - JWT token
 */
const generateToken = (id, option) => {
  // Default secret key fallback - should be set in environment variables
  const defaultSecret = 'tixmojo-fallback-secret-key-do-not-use-in-production';
  
  // Generate different tokens based on the option parameter
  switch (option) {
    case 'access':
      return jwt.sign(
        { id }, 
        process.env.JWT_ACCESS_TOKEN_SECRET || defaultSecret, 
        { expiresIn: '1h' } // 1 hour
      );
      
    case 'refresh':
      return jwt.sign(
        { id }, 
        process.env.JWT_REFRESH_TOKEN_SECRET || defaultSecret, 
        { expiresIn: '7d' } // 7 days
      );
      
    case 'email':
      return jwt.sign(
        { id }, 
        process.env.JWT_EMAIL_TOKEN_SECRET || defaultSecret, 
        { expiresIn: '15m' } // 15 minutes
      );
      
    case 'forgot-password':
      return jwt.sign(
        { id }, 
        process.env.JWT_FORGOT_PASSWORD_TOKEN_SECRET || defaultSecret, 
        { expiresIn: '10m' } // 10 minutes
      );
      
    case 'login':
      return jwt.sign(
        { id }, 
        process.env.JWT_SECRET || defaultSecret, 
        { expiresIn: '2d' } // 2 days
      );
      
    default:
      // Default to a short-lived token
      return jwt.sign(
        { id }, 
        process.env.JWT_SECRET || defaultSecret, 
        { expiresIn: '1h' } // 1 hour
      );
  }
};

module.exports = generateToken;