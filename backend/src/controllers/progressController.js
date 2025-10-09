import { supabase } from '../config/database.js';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get user's progress for all lessons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  // Build query
  let query = supabase
    .from('progress')
    .select(`
      id,
      status,
      score,
      completed_at,
      created_at,
      updated_at,
      lessons!inner(
        id,
        title,
        description,
        category,
        xp_reward,
        order_index
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Filter by status if provided
  if (status && ['not_started', 'in_progress', 'completed'].includes(status)) {
    query = query.eq('status', status);
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('Progress count error:', countError);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: progress, error } = await query;

  if (error) {
    console.error('Progress fetch error:', error);
    return sendError(res, 'Failed to fetch progress', 500);
  }

  // Format response
  const formattedProgress = progress.map(p => ({
    id: p.id,
    status: p.status,
    score: p.score,
    completedAt: p.completed_at,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    lesson: {
      id: p.lessons.id,
      title: p.lessons.title,
      description: p.lessons.description,
      category: p.lessons.category,
      xpReward: p.lessons.xp_reward,
      orderIndex: p.lessons.order_index
    }
  }));

  const meta = {
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil((count || 0) / limit),
      totalItems: count || 0,
      itemsPerPage: parseInt(limit)
    }
  };

  sendSuccess(res, 'Progress retrieved successfully', formattedProgress, meta);
});

/**
 * Update lesson progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { lessonId, status, score } = req.body;

  // Validate lesson exists
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id, title, xp_reward')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return sendNotFound(res, 'Lesson');
  }

  // Check if progress record exists
  const { data: existingProgress, error: existingError } = await supabase
    .from('progress')
    .select('id, status, score')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  let progressData;
  let isNewRecord = false;

  if (existingError && existingError.code === 'PGRST116') {
    // Create new progress record
    const progressPayload = {
      user_id: userId,
      lesson_id: lessonId,
      status: status || 'in_progress',
      score: score || 0
    };

    if (status === 'completed') {
      progressPayload.completed_at = new Date().toISOString();
    }

    const { data: newProgress, error: createError } = await supabase
      .from('progress')
      .insert([progressPayload])
      .select('*')
      .single();

    if (createError) {
      console.error('Progress creation error:', createError);
      return sendError(res, 'Failed to create progress record', 500);
    }

    progressData = newProgress;
    isNewRecord = true;
  } else if (existingError) {
    console.error('Progress fetch error:', existingError);
    return sendError(res, 'Failed to fetch existing progress', 500);
  } else {
    // Update existing progress record
    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (score !== undefined) updatePayload.score = score;
    if (status === 'completed' && existingProgress.status !== 'completed') {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: updatedProgress, error: updateError } = await supabase
      .from('progress')
      .update(updatePayload)
      .eq('id', existingProgress.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Progress update error:', updateError);
      return sendError(res, 'Failed to update progress', 500);
    }

    progressData = updatedProgress;
  }

  // Update user stats if lesson is completed
  if (status === 'completed' && (isNewRecord || existingProgress.status !== 'completed')) {
    // Add XP to user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, streak')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      const newXp = user.xp + lesson.xp_reward;
      const newStreak = user.streak + 1; // Increment streak

      await supabase
        .from('users')
        .update({ xp: newXp, streak: newStreak })
        .eq('id', userId);
    }
  }

  sendSuccess(res, 'Progress updated successfully', {
    id: progressData.id,
    status: progressData.status,
    score: progressData.score,
    completedAt: progressData.completed_at,
    createdAt: progressData.created_at,
    updatedAt: progressData.updated_at,
    lesson: {
      id: lesson.id,
      title: lesson.title,
      xpReward: lesson.xp_reward
    },
    isNewRecord
  });
});

/**
 * Get progress statistics for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProgressStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's current stats
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('xp, coins, streak')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('User stats error:', userError);
    return sendError(res, 'Failed to fetch user stats', 500);
  }

  // Get progress summary for this user
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('status, score, lessons!inner(xp_reward)')
    .eq('user_id', userId);

  if (progressError) {
    console.error('Progress stats error:', progressError);
    return sendError(res, 'Failed to fetch progress stats', 500);
  }

  // Get total number of lessons available (across the platform)
  const { count: totalLessonsCount, error: lessonsCountError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  if (lessonsCountError) {
    console.error('Lessons count error:', lessonsCountError);
  }

  // Calculate statistics
  const totalLessons = totalLessonsCount || 0;
  const completedLessons = progress.filter(p => p.status === 'completed').length;
  const inProgressLessons = progress.filter(p => p.status === 'in_progress').length;
  // notStarted = total lessons minus those with any progress record
  const notStartedLessons = Math.max(0, totalLessons - (completedLessons + inProgressLessons));

  const totalXpEarned = progress
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.lessons.xp_reward, 0);

  const averageScore = completedLessons > 0 
    ? Math.round(progress
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.score, 0) / completedLessons)
    : 0;

  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentActivity, error: activityError } = await supabase
    .from('progress')
    .select('status, completed_at, lessons!inner(title)')
    .eq('user_id', userId)
    .gte('updated_at', sevenDaysAgo.toISOString())
    .order('updated_at', { ascending: false });

  if (activityError) {
    console.error('Recent activity error:', activityError);
  }

  sendSuccess(res, 'Progress statistics retrieved successfully', {
    user: {
      xp: user.xp,
      coins: user.coins,
      streak: user.streak
    },
    lessons: {
      total: totalLessons,
      completed: completedLessons,
      inProgress: inProgressLessons,
      notStarted: notStartedLessons,
      completionRate
    },
    performance: {
      totalXpEarned,
      averageScore,
      totalXpFromLessons: totalXpEarned
    },
    recentActivity: recentActivity?.map(activity => ({
      status: activity.status,
      completedAt: activity.completed_at,
      lessonTitle: activity.lessons.title
    })) || []
  });
});

/**
 * Reset user progress (for testing/admin purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const resetProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { lessonId } = req.body;

  if (lessonId) {
    // Reset specific lesson progress
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Progress reset error:', error);
      return sendError(res, 'Failed to reset lesson progress', 500);
    }

    sendSuccess(res, 'Lesson progress reset successfully');
  } else {
    // Reset all progress
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Progress reset error:', error);
      return sendError(res, 'Failed to reset all progress', 500);
    }

    // Reset user stats
    await supabase
      .from('users')
      .update({ xp: 0, streak: 0 })
      .eq('id', userId);

    sendSuccess(res, 'All progress reset successfully');
  }
});
