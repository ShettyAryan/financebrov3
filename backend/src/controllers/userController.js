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
    .select('id, email, username')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existingUser) {
    const errors = {};
    if (existingUser.email === email) {
      errors.email = 'An account with this email address already exists';
    }
    if (existingUser.username === username) {
      errors.username = 'This username is already taken';
    }
    
    return res.status(409).json({
      success: false,
      message: 'Account already exists',
      errors,
      fieldErrors: errors
    });
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
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      const errors = {};
      if (error.message.includes('email')) {
        errors.email = 'An account with this email address already exists';
      }
      if (error.message.includes('username')) {
        errors.username = 'This username is already taken';
      }
      
      return res.status(409).json({
        success: false,
        message: 'Account already exists',
        errors,
        fieldErrors: errors
      });
    }
    
    return sendError(res, 'Failed to create user account. Please try again.', 500);
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
    .select('id, username, email, password_hash, xp, coins, streak, created_at, updated_at')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: {
        email: 'No account found with this email address',
        password: 'Please check your password and try again'
      },
      fieldErrors: {
        email: 'No account found with this email address',
        password: 'Please check your password and try again'
      }
    });
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errors: {
        password: 'Incorrect password. Please try again.'
      },
      fieldErrors: {
        password: 'Incorrect password. Please try again.'
      }
    });
  }

  // Update streak based on time since last activity (using updated_at as proxy)
  let updatedUser = user;
  try {
    const now = new Date();
    const lastActivity = user.updated_at ? new Date(user.updated_at) : null;
    let newStreak = user.streak || 0;

    if (lastActivity) {
      const hoursSince = Math.abs(now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 24 && hoursSince < 48) {
        newStreak = (user.streak || 0) + 1;
      } else if (hoursSince >= 48) {
        newStreak = 0;
      }
    } else {
      newStreak = Math.max(user.streak || 0, 1);
    }

    if (newStreak !== user.streak) {
      const { data: upd, error: updErr } = await supabaseAdmin
        .from('users')
        .update({ streak: newStreak })
        .eq('id', user.id)
        .select('id, username, email, xp, coins, streak, created_at')
        .single();
      if (!updErr && upd) {
        updatedUser = upd;
      }
    }
  } catch (e) {
    // Non-fatal; continue login even if streak update fails
    console.error('Streak update on login failed:', e);
  }

  // Generate JWT token
  const token = generateToken(updatedUser);

  // Return user data and token
  sendSuccess(res, 'Login successful', {
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      xp: updatedUser.xp,
      coins: updatedUser.coins,
      streak: updatedUser.streak,
      createdAt: updatedUser.created_at
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

  // Calculate progress statistics including accuracy rate
  const totalLessons = progressData?.length || 0;
  const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
  const inProgressLessons = progressData?.filter(p => p.status === 'in_progress').length || 0;

  // Accuracy rate as average score across completed lessons (0-100)
  const completedWithScores = (progressData || []).filter(p => p.status === 'completed');
  const accuracyRate = completedWithScores.length > 0
    ? Math.round(
        (completedWithScores.reduce((sum, p) => sum + (p.lessons?.xp_reward ? (p.score || 0) : (p.score || 0)), 0) /
          completedWithScores.length)
      )
    : 0;

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
      completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      accuracyRate
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
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email, username')
      .neq('id', userId)
      .or(`email.eq.${email || ''},username.eq.${username || ''}`)
      .single();

    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors.email = 'This email address is already in use by another account';
      }
      if (existingUser.username === username) {
        errors.username = 'This username is already taken by another user';
      }
      
      return res.status(409).json({
        success: false,
        message: 'Update failed',
        errors,
        fieldErrors: errors
      });
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

/**
 * Update user stats with deltas and optionally complete a lesson and unlock the next
 * Request body: { xpDelta?, coinsDelta?, streakIncrement?, lessonId?, score? }
 */
export const updateStatsAndUnlock = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { xpDelta = 0, coinsDelta = 0, streakIncrement = 0, lessonId, score } = req.body;

  // Fetch current user
  const { data: currentUser, error: userErr } = await supabase
    .from('users')
    .select('id, xp, coins, streak')
    .eq('id', userId)
    .single();

  if (userErr || !currentUser) {
    return sendError(res, 'Failed to load user', 500);
  }

  // Compute new values (non-negative guards)
  const newXp = Math.max(0, (currentUser.xp || 0) + (typeof xpDelta === 'number' ? xpDelta : 0));
  const newCoins = Math.max(0, (currentUser.coins || 0) + (typeof coinsDelta === 'number' ? coinsDelta : 0));
  const newStreak = Math.max(0, (currentUser.streak || 0) + (typeof streakIncrement === 'number' ? streakIncrement : 0));

  // Update stats
  const { data: updated, error: updErr } = await supabase
    .from('users')
    .update({ xp: newXp, coins: newCoins, streak: newStreak })
    .eq('id', userId)
    .select('id, username, xp, coins, streak, updated_at')
    .single();

  if (updErr) {
    console.error('Delta stats update error:', updErr);
    return sendError(res, 'Failed to update stats', 500);
  }

  let unlocked = false;
  let nextLesson = null;

  // If lessonId provided, upsert progress and possibly unlock next on sufficient score
  if (lessonId) {
    // Upsert progress for this lesson
    const status = typeof score === 'number' && score >= 40 ? 'completed' : 'in_progress';

    const { data: progressUpsert, error: progressErr } = await supabase
      .from('progress')
      .upsert(
        { user_id: userId, lesson_id: lessonId, status, score: score || 0, completed_at: status === 'completed' ? new Date().toISOString() : null },
        { onConflict: 'user_id,lesson_id' }
      )
      .select('id, status')
      .single();

    if (progressErr) {
      console.error('Progress upsert error:', progressErr);
    }

    // If completed, find and unlock next lesson
    if (progressUpsert && progressUpsert.status === 'completed') {
      const { data: currentLesson, error: curErr } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('id', lessonId)
        .single();

      if (!curErr && currentLesson) {
        const { data: next, error: nextErr } = await supabase
          .from('lessons')
          .select('id, title, order_index')
          .eq('order_index', currentLesson.order_index + 1)
          .single();

        if (!nextErr && next) {
          // Ensure progress exists for next lesson
          const { data: existingProgress, error: existingErr } = await supabase
            .from('progress')
            .select('id')
            .eq('user_id', userId)
            .eq('lesson_id', next.id)
            .single();

          if (existingErr && existingErr.code !== 'PGRST116') {
            console.error('Next progress check error:', existingErr);
          }

          if (!existingProgress) {
            const { error: createErr } = await supabase
              .from('progress')
              .insert([{ user_id: userId, lesson_id: next.id, status: 'not_started', score: 0 }]);

            if (!createErr) {
              unlocked = true;
              nextLesson = { id: next.id, title: next.title, orderIndex: next.order_index };
            }
          }
        }
      }
    }
  }

  sendSuccess(res, 'Stats updated', {
    user: {
      id: updated.id,
      username: updated.username,
      xp: updated.xp,
      coins: updated.coins,
      streak: updated.streak,
      updatedAt: updated.updated_at
    },
    unlocked,
    nextLesson
  });
});

/**
 * Get user progress summary: lessons completed, total XP, coins balance
 */
export const getUserProgressSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, xp, coins')
    .eq('id', userId)
    .single();

  if (userErr || !user) {
    return sendError(res, 'Failed to load user', 500);
  }

  const { data: progress, error: progErr } = await supabase
    .from('progress')
    .select('status, score')
    .eq('user_id', userId);

  if (progErr) {
    console.error('Progress summary error:', progErr);
  }

  const completedLessons = (progress || []).filter(p => p.status === 'completed').length;
  const accuracyRate = (() => {
    const completed = (progress || []).filter(p => p.status === 'completed');
    if (completed.length === 0) return 0;
    const avg = completed.reduce((sum, p) => sum + (p.score || 0), 0) / completed.length;
    return Math.round(avg);
  })();

  sendSuccess(res, 'Progress summary', {
    completedLessons,
    totalXp: user.xp,
    coinsBalance: user.coins,
    accuracyRate
  });
});
