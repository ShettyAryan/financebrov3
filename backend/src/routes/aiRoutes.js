import express from 'express';
import { 
  testAIService, 
  generateFeedback, 
  generatePracticeScenarios, 
  analyzeLearningPatterns, 
  getAIHealth 
} from '../controllers/aiController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/ai/test
 * @desc    Test AI service integration
 * @access  Public (for testing)
 */
router.get('/test', testAIService);

/**
 * @route   GET /api/ai/health
 * @desc    Get AI service health status
 * @access  Public
 */
router.get('/health', getAIHealth);

/**
 * @route   POST /api/ai/feedback
 * @desc    Generate personalized feedback for user answers
 * @access  Private
 */
router.post('/feedback', authenticateToken, generateFeedback);

/**
 * @route   POST /api/ai/scenarios
 * @desc    Generate practice scenarios based on user level and preferences
 * @access  Private
 */
router.post('/scenarios', authenticateToken, generatePracticeScenarios);

/**
 * @route   GET /api/ai/analysis
 * @desc    Analyze user learning patterns and provide recommendations
 * @access  Private
 */
router.get('/analysis', authenticateToken, analyzeLearningPatterns);

export default router;
