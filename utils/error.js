/**
 * Creates a standardized error object with status code and message
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} - Error object with status and message
 */
const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  err.message = message;
  return err;
};

// Common HTTP error factory functions
const BadRequestError = (message = 'Bad Request') => createError(400, message);
const UnauthorizedError = (message = 'Unauthorized') => createError(401, message);
const ForbiddenError = (message = 'Forbidden') => createError(403, message);
const NotFoundError = (message = 'Not Found') => createError(404, message);
const ConflictError = (message = 'Conflict') => createError(409, message);
const InternalServerError = (message = 'Internal Server Error') => createError(500, message);

module.exports = {
  createError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError
};