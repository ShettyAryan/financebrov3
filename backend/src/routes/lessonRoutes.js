import express from 'express';
import { 
  getAllLessons, 
  getLessonById, 
  unlockNextLesson, 
  getLessonCategories 
} from '../controllers/lessonController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import { validateUUID } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/lessons
 * @desc    Get all lessons with optional user progress
 * @access  Public (with optional auth for progress)
 */
router.get('/', optionalAuth, getAllLessons);

/**
 * @route   GET /api/lessons/categories
 * @desc    Get all lesson categories
 * @access  Public
 */
router.get('/categories', getLessonCategories);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get specific lesson by ID
 * @access  Public (with optional auth for progress)
 */
router.get('/:id', validateUUID('id'), optionalAuth, getLessonById);

/**
 * @route   POST /api/lessons/unlock
 * @desc    Unlock next lesson for authenticated user
 * @access  Private
 */
router.post('/unlock', authenticateToken, unlockNextLesson);

/**
 * @route   POST /api/lessons/seed
 * @desc    Seed beginner lessons (admin/dev use). Protected to prevent abuse.
 * @access  Private
 */
import { seedLessons } from '../controllers/lessonController.js';
router.post('/seed', authenticateToken, seedLessons);

export default router;
