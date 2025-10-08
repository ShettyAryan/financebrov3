import express from 'express';
import { 
  getPracticeSessions, 
  createPracticeSession, 
  updatePracticeSession, 
  getPracticeStats, 
  deletePracticeSession 
} from '../controllers/practiceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePractice, validateUUID } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/practice
 * @desc    Get user's practice sessions
 * @access  Private
 */
router.get('/', authenticateToken, getPracticeSessions);

/**
 * @route   GET /api/practice/stats
 * @desc    Get practice statistics for user
 * @access  Private
 */
router.get('/stats', authenticateToken, getPracticeStats);

/**
 * @route   POST /api/practice
 * @desc    Create new practice session
 * @access  Private
 */
router.post('/', authenticateToken, validatePractice, createPracticeSession);

/**
 * @route   PUT /api/practice/:id
 * @desc    Update practice session
 * @access  Private
 */
router.put('/:id', validateUUID('id'), authenticateToken, validatePractice, updatePracticeSession);

/**
 * @route   DELETE /api/practice/:id
 * @desc    Delete practice session
 * @access  Private
 */
router.delete('/:id', validateUUID('id'), authenticateToken, deletePracticeSession);

export default router;
