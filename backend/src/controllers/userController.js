import { supabase, supabaseAdmin } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../middleware/auth.js';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists (use admin client to bypass RLS)
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existingUser) {
    return sendError(res, 'User with this email or username already exists', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user (use admin client to bypass RLS)
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        username,
        email,
        password_hash: passwordHash,
        xp: 0,
        coins: 100, // Starting coins
        streak: 0
      }
    ])
    .select('id, username, email, xp, coins, streak, created_at')
    .single();

  if (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Failed to create user account', 500);
  }

  // Generate JWT token
  const token = generateToken(user);

  // Return user data and token
  sendSuccess(res, 'User registered successfully', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      createdAt: user.created_at
    },
    token
  }, null, 201);
});

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (use admin client to bypass RLS)
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, email, password_hash, xp, coins, streak, created_at')
    .eq('email', email)
    .single();

  if (error || !user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken(user);

  // Return user data and token
  sendSuccess(res, 'Login successful', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      createdAt: user.created_at
    },
    token
  });
});

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user data
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, xp, coins, streak, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return sendNotFound(res, 'User');
  }

  // Get user's progress summary
  const { data: progressData, error: progressError } = await supabase
    .from('progress')
    .select(`
      status,
      lessons!inner(id, title, category, xp_reward)
    `)
    .eq('user_id', userId);

  if (progressError) {
    console.error('Progress fetch error:', progressError);
  }

  // Calculate progress statistics
  const totalLessons = progressData?.length || 0;
  const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
  const inProgressLessons = progressData?.filter(p => p.status === 'in_progress').length || 0;

  // Get user's achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('achievement_type, achievement_data, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (achievementsError) {
    console.error('Achievements fetch error:', achievementsError);
  }

  sendSuccess(res, 'Profile retrieved successfully', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    },
    stats: {
      totalLessons,
      completedLessons,
      inProgressLessons,
      completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    },
    achievements: achievements || []
  });
});

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  // Check if username or email is already taken by another user
  if (username || email) {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .neq('id', userId)
      .or(`email.eq.${email || ''},username.eq.${username || ''}`)
      .single();

    if (existingUser) {
      return sendError(res, 'Username or email already taken', 409);
    }
  }

  // Prepare update data
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;

  // Update user
  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, username, email, xp, coins, streak, updated_at')
    .single();

  if (error) {
    console.error('Profile update error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }

  sendSuccess(res, 'Profile updated successfully', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      updatedAt: user.updated_at
    }
  });
});

/**
 * Update user stats (XP, coins, streak)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { xp, coins, streak } = req.body;

  // Validate input
  const updateData = {};
  if (xp !== undefined) {
    if (typeof xp !== 'number' || xp < 0) {
      return sendValidationError(res, ['XP must be a non-negative number']);
    }
    updateData.xp = xp;
  }

  if (coins !== undefined) {
    if (typeof coins !== 'number' || coins < 0) {
      return sendValidationError(res, ['Coins must be a non-negative number']);
    }
    updateData.coins = coins;
  }

  if (streak !== undefined) {
    if (typeof streak !== 'number' || streak < 0) {
      return sendValidationError(res, ['Streak must be a non-negative number']);
    }
    updateData.streak = streak;
  }

  if (Object.keys(updateData).length === 0) {
    return sendValidationError(res, ['At least one stat field is required']);
  }

  // Update user stats
  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, username, xp, coins, streak, updated_at')
    .single();

  if (error) {
    console.error('Stats update error:', error);
    return sendError(res, 'Failed to update stats', 500);
  }

  sendSuccess(res, 'Stats updated successfully', {
    user: {
      id: user.id,
      username: user.username,
      xp: user.xp,
      coins: user.coins,
      streak: user.streak,
      updatedAt: user.updated_at
    }
  });
});
