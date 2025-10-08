import validator from 'validator';

/**
 * Validation middleware for user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
  } else if (username.length < 3 || username.length > 50) {
    errors.push('Username must be between 3 and 50 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for lesson progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateProgress = (req, res, next) => {
  const { lessonId, status, score } = req.body;
  const errors = [];

  if (!lessonId || typeof lessonId !== 'string') {
    errors.push('Lesson ID is required');
  } else if (!validator.isUUID(lessonId)) {
    errors.push('Invalid lesson ID format');
  }

  if (status && !['not_started', 'in_progress', 'completed'].includes(status)) {
    errors.push('Status must be one of: not_started, in_progress, completed');
  }

  if (score !== undefined) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      errors.push('Score must be a number between 0 and 100');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for practice sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validatePractice = (req, res, next) => {
  const { lessonId, coinsEarned, coinsLost, attempts, feedback } = req.body;
  const errors = [];

  if (lessonId && !validator.isUUID(lessonId)) {
    errors.push('Invalid lesson ID format');
  }

  if (coinsEarned !== undefined && (typeof coinsEarned !== 'number' || coinsEarned < 0)) {
    errors.push('Coins earned must be a non-negative number');
  }

  if (coinsLost !== undefined && (typeof coinsLost !== 'number' || coinsLost < 0)) {
    errors.push('Coins lost must be a non-negative number');
  }

  if (attempts !== undefined && (typeof attempts !== 'number' || attempts < 1)) {
    errors.push('Attempts must be a positive number');
  }

  if (feedback && typeof feedback !== 'string') {
    errors.push('Feedback must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Generic UUID validation middleware
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Middleware function
 */
export const validateUUID = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    
    if (!value || !validator.isUUID(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};
