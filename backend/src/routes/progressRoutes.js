import express from 'express';
import { 
  getUserProgress, 
  updateProgress, 
  getProgressStats, 
  resetProgress 
} from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProgress } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/progress
 * @desc    Get user's progress for all lessons
 * @access  Private
 */
router.get('/', authenticateToken, getUserProgress);

/**
 * @route   GET /api/progress/stats
 * @desc    Get progress statistics for user
 * @access  Private
 */
router.get('/stats', authenticateToken, getProgressStats);

/**
 * @route   PUT /api/progress
 * @desc    Update lesson progress
 * @access  Private
 */
router.put('/', authenticateToken, validateProgress, updateProgress);

/**
 * @route   DELETE /api/progress
 * @desc    Reset user progress (for testing/admin)
 * @access  Private
 */
router.delete('/', authenticateToken, resetProgress);

export default router;
