import { supabase } from '../config/database.js';
import { sendSuccess, sendError, sendNotFound, getPaginationMeta } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get user's practice sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPracticeSessions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, lessonId } = req.query;

  // Build query
  let query = supabase
    .from('practice')
    .select(`
      id,
      coins_earned,
      coins_lost,
      attempts,
      last_feedback,
      session_data,
      created_at,
      updated_at,
      lessons!left(
        id,
        title,
        category
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Filter by lesson if provided
  if (lessonId) {
    query = query.eq('lesson_id', lessonId);
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('practice')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('Practice count error:', countError);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: sessions, error } = await query;

  if (error) {
    console.error('Practice sessions fetch error:', error);
    return sendError(res, 'Failed to fetch practice sessions', 500);
  }

  // Format response
  const formattedSessions = sessions.map(session => ({
    id: session.id,
    coinsEarned: session.coins_earned,
    coinsLost: session.coins_lost,
    attempts: session.attempts,
    lastFeedback: session.last_feedback,
    sessionData: session.session_data,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    lesson: session.lessons ? {
      id: session.lessons.id,
      title: session.lessons.title,
      category: session.lessons.category
    } : null
  }));

  const meta = getPaginationMeta(parseInt(page), parseInt(limit), count || 0);

  sendSuccess(res, 'Practice sessions retrieved successfully', formattedSessions, meta);
});

/**
 * Create or update practice session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createPracticeSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    lessonId, 
    coinsEarned = 0, 
    coinsLost = 0, 
    attempts = 1, 
    feedback, 
    sessionData 
  } = req.body;

  // Validate lesson exists if lessonId is provided
  if (lessonId) {
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return sendNotFound(res, 'Lesson');
    }
  }

  // Create practice session
  const practicePayload = {
    user_id: userId,
    lesson_id: lessonId || null,
    coins_earned: coinsEarned,
    coins_lost: coinsLost,
    attempts,
    last_feedback: feedback || null,
    session_data: sessionData || null
  };

  const { data: session, error } = await supabase
    .from('practice')
    .insert([practicePayload])
    .select(`
      id,
      coins_earned,
      coins_lost,
      attempts,
      last_feedback,
      session_data,
      created_at,
      lessons!left(
        id,
        title,
        category
      )
    `)
    .single();

  if (error) {
    console.error('Practice session creation error:', error);
    return sendError(res, 'Failed to create practice session', 500);
  }

  // Update user's coin balance
  if (coinsEarned > 0 || coinsLost > 0) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      const newCoins = Math.max(0, user.coins + coinsEarned - coinsLost);
      
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', userId);
    }
  }

  sendSuccess(res, 'Practice session created successfully', {
    id: session.id,
    coinsEarned: session.coins_earned,
    coinsLost: session.coins_lost,
    attempts: session.attempts,
    lastFeedback: session.last_feedback,
    sessionData: session.session_data,
    createdAt: session.created_at,
    lesson: session.lessons ? {
      id: session.lessons.id,
      title: session.lessons.title,
      category: session.lessons.category
    } : null
  }, null, 201);
});

/**
 * Update practice session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePracticeSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { 
    coinsEarned, 
    coinsLost, 
    attempts, 
    feedback, 
    sessionData 
  } = req.body;

  // Check if session exists and belongs to user
  const { data: existingSession, error: existingError } = await supabase
    .from('practice')
    .select('id, coins_earned, coins_lost')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (existingError || !existingSession) {
    return sendNotFound(res, 'Practice session');
  }

  // Prepare update data
  const updateData = {};
  if (coinsEarned !== undefined) updateData.coins_earned = coinsEarned;
  if (coinsLost !== undefined) updateData.coins_lost = coinsLost;
  if (attempts !== undefined) updateData.attempts = attempts;
  if (feedback !== undefined) updateData.last_feedback = feedback;
  if (sessionData !== undefined) updateData.session_data = sessionData;

  // Update session
  const { data: session, error } = await supabase
    .from('practice')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      coins_earned,
      coins_lost,
      attempts,
      last_feedback,
      session_data,
      updated_at,
      lessons!left(
        id,
        title,
        category
      )
    `)
    .single();

  if (error) {
    console.error('Practice session update error:', error);
    return sendError(res, 'Failed to update practice session', 500);
  }

  // Update user's coin balance if coins changed
  const coinsDifference = (coinsEarned || 0) - (coinsLost || 0) - 
                         (existingSession.coins_earned - existingSession.coins_lost);

  if (coinsDifference !== 0) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      const newCoins = Math.max(0, user.coins + coinsDifference);
      
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', userId);
    }
  }

  sendSuccess(res, 'Practice session updated successfully', {
    id: session.id,
    coinsEarned: session.coins_earned,
    coinsLost: session.coins_lost,
    attempts: session.attempts,
    lastFeedback: session.last_feedback,
    sessionData: session.session_data,
    updatedAt: session.updated_at,
    lesson: session.lessons ? {
      id: session.lessons.id,
      title: session.lessons.title,
      category: session.lessons.category
    } : null
  });
});

/**
 * Get practice statistics for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPracticeStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's current coin balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('User coins error:', userError);
    return sendError(res, 'Failed to fetch user coins', 500);
  }

  // Get practice session summary
  const { data: sessions, error: sessionsError } = await supabase
    .from('practice')
    .select('coins_earned, coins_lost, attempts, created_at')
    .eq('user_id', userId);

  if (sessionsError) {
    console.error('Practice sessions error:', sessionsError);
    return sendError(res, 'Failed to fetch practice sessions', 500);
  }

  // Calculate statistics
  const totalSessions = sessions.length;
  const totalCoinsEarned = sessions.reduce((sum, s) => sum + s.coins_earned, 0);
  const totalCoinsLost = sessions.reduce((sum, s) => sum + s.coins_lost, 0);
  const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts, 0);
  const netCoins = totalCoinsEarned - totalCoinsLost;

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSessions = sessions.filter(s => 
    new Date(s.created_at) >= sevenDaysAgo
  );

  const recentCoinsEarned = recentSessions.reduce((sum, s) => sum + s.coins_earned, 0);
  const recentCoinsLost = recentSessions.reduce((sum, s) => sum + s.coins_lost, 0);

  // Calculate success rate (sessions with positive net coins)
  const successfulSessions = sessions.filter(s => s.coins_earned > s.coins_lost).length;
  const successRate = totalSessions > 0 ? Math.round((successfulSessions / totalSessions) * 100) : 0;

  sendSuccess(res, 'Practice statistics retrieved successfully', {
    currentCoins: user.coins,
    totalSessions,
    totalCoinsEarned,
    totalCoinsLost,
    netCoins,
    totalAttempts,
    successRate,
    recentActivity: {
      sessions: recentSessions.length,
      coinsEarned: recentCoinsEarned,
      coinsLost: recentCoinsLost,
      netCoins: recentCoinsEarned - recentCoinsLost
    },
    averages: {
      coinsPerSession: totalSessions > 0 ? Math.round(totalCoinsEarned / totalSessions) : 0,
      attemptsPerSession: totalSessions > 0 ? Math.round(totalAttempts / totalSessions) : 0
    }
  });
});

/**
 * Delete practice session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deletePracticeSession = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Check if session exists and belongs to user
  const { data: session, error: existingError } = await supabase
    .from('practice')
    .select('id, coins_earned, coins_lost')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (existingError || !session) {
    return sendNotFound(res, 'Practice session');
  }

  // Delete session
  const { error } = await supabase
    .from('practice')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Practice session deletion error:', error);
    return sendError(res, 'Failed to delete practice session', 500);
  }

  // Adjust user's coin balance
  const coinsToRemove = session.coins_earned - session.coins_lost;
  if (coinsToRemove !== 0) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      const newCoins = Math.max(0, user.coins - coinsToRemove);
      
      await supabase
        .from('users')
        .update({ coins: newCoins })
        .eq('id', userId);
    }
  }

  sendSuccess(res, 'Practice session deleted successfully');
});
