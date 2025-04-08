/**
 * Sends a success response
 * @param {object} res - Express response object
 * @param {*} data - Data to send in response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Optional success message
 */
const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} error - Optional error details
 */
const sendError = (res, statusCode = 500, message = 'Server Error', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV !== 'production') {
    response.error = error.toString();
  }

  return res.status(statusCode).json(response);
};

/**
 * Respond with success
 * Alternative naming convention used in payment controller
 */
const respondWithSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Respond with error
 * Alternative naming convention used in payment controller
 */
const respondWithError = (res, message, statusCode = 500, extras = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extras
  });
};

module.exports = {
  sendSuccess,
  sendError,
  respondWithSuccess,
  respondWithError
};