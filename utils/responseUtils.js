/**
 * Sends a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Optional data to send in response
 */
const handleResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Optional error details
 */
const handleError = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors && process.env.NODE_ENV !== 'production') {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  handleResponse,
  handleError,
  // Keep backward compatibility with existing code
  sendSuccess: (res, data, statusCode = 200, message = 'Success') => 
    handleResponse(res, statusCode, message, data),
  sendError: (res, statusCode = 500, message = 'Server Error', error = null) => 
    handleError(res, statusCode, message, error)
};