/**
 * Standard API response formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} Formatted response
 */
export const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta })
  };

  return res.status(statusCode).json(response);
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Success response
 */
export const sendSuccess = (res, message, data = null, meta = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Error details
 * @returns {Object} Error response
 */
export const sendError = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage
    }
  };
};

/**
 * Validation error response helper
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @returns {Object} Validation error response
 */
export const sendValidationError = (res, errors) => {
  return sendError(res, 'Validation failed', 400, errors);
};

/**
 * Not found response helper
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name
 * @returns {Object} Not found response
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Unauthorized response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Unauthorized response
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401);
};

/**
 * Forbidden response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Forbidden response
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, message, 403);
};

/**
 * Server error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} Server error response
 */
export const sendServerError = (res, message = 'Internal server error') => {
  return sendError(res, message, 500);
};
