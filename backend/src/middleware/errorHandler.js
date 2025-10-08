import { config } from '../config/environment.js';

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    error = handleSupabaseError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      statusCode: 400,
      errors: Object.values(err.errors).map(val => val.message)
    };
  }

  // Duplicate key errors
  if (err.code === 11000) {
    error = {
      message: 'Duplicate field value entered',
      statusCode: 400
    };
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
    ...(error.errors && { errors: error.errors })
  });
};

/**
 * Handle Supabase-specific errors
 * @param {Error} err - Supabase error
 * @returns {Object} Formatted error object
 */
const handleSupabaseError = (err) => {
  const errorMap = {
    'PGRST116': { message: 'Resource not found', statusCode: 404 },
    'PGRST301': { message: 'Duplicate key violation', statusCode: 409 },
    'PGRST302': { message: 'Foreign key violation', statusCode: 400 },
    'PGRST303': { message: 'Check constraint violation', statusCode: 400 },
    'PGRST304': { message: 'Not null violation', statusCode: 400 },
    'PGRST305': { message: 'Unique constraint violation', statusCode: 409 }
  };

  return errorMap[err.code] || {
    message: 'Database error',
    statusCode: 500
  };
};

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to catch async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
