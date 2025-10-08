import validator from 'validator';

/**
 * Validation middleware for user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = {};

  // Username validation
  if (!username || typeof username !== 'string') {
    errors.username = 'Username is required';
  } else if (username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (username.length > 50) {
    errors.username = 'Username cannot be longer than 50 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  } else if (username.startsWith('_') || username.endsWith('_')) {
    errors.username = 'Username cannot start or end with an underscore';
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.email = 'Email address is required';
  } else if (!validator.isEmail(email.trim())) {
    errors.email = 'Please enter a valid email address (e.g., user@example.com)';
  } else if (email.length > 255) {
    errors.email = 'Email address is too long';
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (password.length > 128) {
    errors.password = 'Password is too long (maximum 128 characters)';
  } else {
    const passwordIssues = [];
    
    if (!/(?=.*[a-z])/.test(password)) {
      passwordIssues.push('one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      passwordIssues.push('one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      passwordIssues.push('one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      passwordIssues.push('one special character (@$!%*?&)');
    }
    
    if (passwordIssues.length > 0) {
      errors.password = `Password must contain at least ${passwordIssues.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please fix the following errors',
      errors,
      fieldErrors: errors // For easier frontend handling
    });
  }

  // Trim whitespace from inputs
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();

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
  const errors = {};

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.email = 'Email address is required';
  } else if (!validator.isEmail(email.trim())) {
    errors.email = 'Please enter a valid email address';
  } else if (email.length > 255) {
    errors.email = 'Email address is too long';
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required';
  } else if (password.length === 0) {
    errors.password = 'Password cannot be empty';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please fix the following errors',
      errors,
      fieldErrors: errors
    });
  }

  // Trim and normalize email
  req.body.email = email.trim().toLowerCase();

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
