import { supabase } from '../config/database.js';
import { sendSuccess, sendError, sendNotFound, getPaginationMeta } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all lessons with user progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllLessons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const userId = req.user?.id; // Optional auth for public access

  // Build query
  let query = supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      category,
      xp_reward,
      order_index,
      is_unlocked_by_default,
      created_at
    `)
    .order('order_index', { ascending: true });

  // Filter by category if provided
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: lessons, error } = await query;

  if (error) {
    console.error('Lessons fetch error:', error);
    return sendError(res, 'Failed to fetch lessons', 500);
  }

  // Get user progress if authenticated
  let userProgress = {};
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, status, score, completed_at')
      .eq('user_id', userId);

    if (!progressError && progress) {
      userProgress = progress.reduce((acc, p) => {
        acc[p.lesson_id] = {
          status: p.status,
          score: p.score,
          completedAt: p.completed_at
        };
        return acc;
      }, {});
    }
  }

  // Determine lesson unlock status
  const lessonsWithStatus = lessons.map(lesson => {
    const progress = userProgress[lesson.id];
    let isUnlocked = lesson.is_unlocked_by_default;
    let isCompleted = false;

    if (progress) {
      isCompleted = progress.status === 'completed';
    }

    // Unlock logic: first lesson is always unlocked, others unlock when previous is completed
    if (!lesson.is_unlocked_by_default && userId) {
      // Check if previous lesson is completed
      const previousLessonIndex = lessons.findIndex(l => l.order_index === lesson.order_index - 1);
      if (previousLessonIndex >= 0) {
        const previousLesson = lessons[previousLessonIndex];
        const previousProgress = userProgress[previousLesson.id];
        isUnlocked = previousProgress && previousProgress.status === 'completed';
      }
    }

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      xpReward: lesson.xp_reward,
      orderIndex: lesson.order_index,
      isUnlocked,
      isCompleted,
      status: progress?.status || 'not_started',
      score: progress?.score || 0,
      completedAt: progress?.completedAt || null,
      createdAt: lesson.created_at
    };
  });

  const meta = getPaginationMeta(parseInt(page), parseInt(limit), count || 0);

  sendSuccess(res, 'Lessons retrieved successfully', lessonsWithStatus, meta);
});

/**
 * Get a specific lesson by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Optional auth

  // Get lesson details
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lesson) {
    return sendNotFound(res, 'Lesson');
  }

  // Get user progress if authenticated
  let userProgress = null;
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('status, score, completed_at, created_at, updated_at')
      .eq('user_id', userId)
      .eq('lesson_id', id)
      .single();

    if (!progressError && progress) {
      userProgress = {
        status: progress.status,
        score: progress.score,
        completedAt: progress.completed_at,
        createdAt: progress.created_at,
        updatedAt: progress.updated_at
      };
    }
  }

  // Check if lesson is unlocked
  let isUnlocked = lesson.is_unlocked_by_default;
  if (!lesson.is_unlocked_by_default && userId) {
    // Get previous lesson
    const { data: previousLesson, error: prevError } = await supabase
      .from('lessons')
      .select('id')
      .eq('order_index', lesson.order_index - 1)
      .single();

    if (!prevError && previousLesson) {
      // Check if previous lesson is completed
      const { data: prevProgress, error: prevProgressError } = await supabase
        .from('progress')
        .select('status')
        .eq('user_id', userId)
        .eq('lesson_id', previousLesson.id)
        .single();

      isUnlocked = !prevProgressError && prevProgress && prevProgress.status === 'completed';
    }
  }

  sendSuccess(res, 'Lesson retrieved successfully', {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    xpReward: lesson.xp_reward,
    orderIndex: lesson.order_index,
    content: lesson.content,
    isUnlocked,
    isCompleted: userProgress?.status === 'completed',
    userProgress,
    createdAt: lesson.created_at,
    updatedAt: lesson.updated_at
  });
});

/**
 * Unlock next lesson for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unlockNextLesson = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's completed lessons
  const { data: completedLessons, error: completedError } = await supabase
    .from('progress')
    .select(`
      lesson_id,
      lessons!inner(order_index)
    `)
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (completedError) {
    console.error('Completed lessons fetch error:', completedError);
    return sendError(res, 'Failed to fetch user progress', 500);
  }

  // Find the highest order index of completed lessons
  const completedOrderIndexes = completedLessons?.map(p => p.lessons.order_index) || [];
  const maxCompletedOrder = completedOrderIndexes.length > 0 ? Math.max(...completedOrderIndexes) : 0;

  // Find the next lesson to unlock
  const { data: nextLesson, error: nextError } = await supabase
    .from('lessons')
    .select('id, title, order_index')
    .eq('order_index', maxCompletedOrder + 1)
    .single();

  if (nextError || !nextLesson) {
    return sendSuccess(res, 'No new lessons to unlock', {
      unlocked: false,
      message: 'You have completed all available lessons!'
    });
  }

  // Check if lesson is already unlocked (has progress record)
  const { data: existingProgress, error: progressError } = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', nextLesson.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    console.error('Progress check error:', progressError);
    return sendError(res, 'Failed to check lesson progress', 500);
  }

  if (existingProgress) {
    return sendSuccess(res, 'Lesson already unlocked', {
      unlocked: false,
      lesson: {
        id: nextLesson.id,
        title: nextLesson.title,
        orderIndex: nextLesson.order_index
      }
    });
  }

  // Create progress record to unlock the lesson
  const { data: newProgress, error: createError } = await supabase
    .from('progress')
    .insert([
      {
        user_id: userId,
        lesson_id: nextLesson.id,
        status: 'not_started',
        score: 0
      }
    ])
    .select('id, status, created_at')
    .single();

  if (createError) {
    console.error('Progress creation error:', createError);
    return sendError(res, 'Failed to unlock lesson', 500);
  }

  sendSuccess(res, 'Lesson unlocked successfully', {
    unlocked: true,
    lesson: {
      id: nextLesson.id,
      title: nextLesson.title,
      orderIndex: nextLesson.order_index
    },
    progress: {
      id: newProgress.id,
      status: newProgress.status,
      createdAt: newProgress.created_at
    }
  });
});

/**
 * Get lesson categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLessonCategories = asyncHandler(async (req, res) => {
  const { data: categories, error } = await supabase
    .from('lessons')
    .select('category')
    .order('category');

  if (error) {
    console.error('Categories fetch error:', error);
    return sendError(res, 'Failed to fetch categories', 500);
  }

  // Get unique categories with counts
  const categoryCounts = categories.reduce((acc, lesson) => {
    acc[lesson.category] = (acc[lesson.category] || 0) + 1;
    return acc;
  }, {});

  const uniqueCategories = Object.keys(categoryCounts).map(category => ({
    name: category,
    count: categoryCounts[category]
  }));

  sendSuccess(res, 'Categories retrieved successfully', uniqueCategories);
});
