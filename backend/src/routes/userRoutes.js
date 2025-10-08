import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  updateUserStats, 
  updateStatsAndUnlock, 
  getUserProgressSummary 
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, loginUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, updateUserProfile);

/**
 * @route   PUT /api/users/stats
 * @desc    Update user stats (XP, coins, streak)
 * @access  Private
 */
router.put('/stats', authenticateToken, updateUserStats);

/**
 * @route   POST /api/users/updateStats
 * @desc    Update stats with deltas and unlock next lesson if completed
 * @access  Private
 */
router.post('/updateStats', authenticateToken, updateStatsAndUnlock);

/**
 * @route   GET /api/users/progress
 * @desc    Get user progress summary (completed lessons, total XP, coins)
 * @access  Private
 */
router.get('/progress', authenticateToken, getUserProgressSummary);

export default router;
