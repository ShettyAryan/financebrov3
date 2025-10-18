import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { config } from '../config/environment.js';

/**
 * Test AI service integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const testAIService = asyncHandler(async (req, res) => {
  // This is a placeholder endpoint for testing AI service connectivity
  // In the future, this will make HTTP requests to the Python FastAPI + Gemini service
  
  const mockResponse = {
    service: 'FinanceBro AI Service',
    status: 'ready',
    version: '1.0.0',
    capabilities: [
      'Personalized feedback generation',
      'Content recommendation',
      'Practice scenario creation',
      'Progress analysis',
      'Learning path optimization'
    ],
    integration: {
      pythonService: 'FastAPI + Gemini',
      status: 'placeholder',
      endpoint: 'http://localhost:8000/api/ai',
      authentication: 'API key based'
    },
    message: 'AI service integration ready for implementation'
  };

  sendSuccess(res, 'AI service test successful', mockResponse);
});

/**
 * Generate personalized feedback (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateFeedback = asyncHandler(async (req, res) => {
  const { lessonId, userAnswer, question, context } = req.body;

  // Placeholder for AI feedback generation
  // In the future, this will call the Python FastAPI service with Gemini
  
  const mockFeedback = {
    feedbackId: `feedback_${Date.now()}`,
    lessonId,
    isCorrect: Math.random() > 0.3, // Mock correctness
    score: Math.floor(Math.random() * 40) + 60, // Mock score 60-100
    feedback: {
      general: "Good attempt! You're on the right track with your analysis.",
      strengths: [
        "You correctly identified the key financial metrics",
        "Your reasoning shows understanding of basic concepts"
      ],
      improvements: [
        "Consider the industry context when evaluating ratios",
        "Look at trends over multiple periods for better insights"
      ],
      suggestions: [
        "Review the lesson on industry comparisons",
        "Practice with more real-world scenarios"
      ]
    },
    personalizedTips: [
      "Based on your learning style, try visualizing the data with charts",
      "Your strong suit is ratio analysis - build on this strength"
    ],
    nextSteps: {
      recommendedLesson: "Industry Analysis Fundamentals",
      practiceFocus: "Multi-period trend analysis",
      difficultyLevel: "intermediate"
    },
    aiMetadata: {
      model: "gemini-pro",
      confidence: 0.87,
      processingTime: "2.3s",
      version: "1.0.0"
    }
  };

  sendSuccess(res, 'Feedback generated successfully', mockFeedback);
});

/**
 * Generate practice scenarios (FastAPI forwarding)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generatePracticeScenarios = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { lessonId, conceptName, lessonContent } = req.body;

  // Check if AI service URL is configured
  const baseUrl = config.aiService.url;
  if (!baseUrl) {
    console.error('AI Service URL not configured. Set PRACTICE_AI_URL or AI_SERVICE_URL environment variable.');
    return sendError(res, 'AI service not configured', 500);
  }

  try {
    console.log(`Attempting to connect to AI service at: ${baseUrl}/api/practice/generate`);
    
    const response = await fetch(`${baseUrl}/api/practice/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        lesson_id: lessonId,
        concept_name: conceptName,
        lesson_content: lessonContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI service error (${response.status}):`, errorText);
      let errorMessage = 'Failed to generate practice';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      return sendError(res, errorMessage, response.status);
    }

    const data = await response.json();
    return sendSuccess(res, 'Practice generated', data);
  } catch (e) {
    console.error('AI generate error:', e);
    
    // Provide more specific error messages
    if (e.code === 'ENOTFOUND') {
      return sendError(res, 'AI service not reachable - check URL configuration', 500);
    }
    if (e.code === 'ECONNREFUSED') {
      return sendError(res, 'AI service connection refused - service may be down', 500);
    }
    if (e.message.includes('fetch')) {
      return sendError(res, 'Failed to connect to AI service', 500);
    }
    
    return sendError(res, 'Failed to generate practice', 500);
  }
});

/**
 * Evaluate practice results (FastAPI forwarding) and update Supabase
 */
export const evaluatePractice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { lessonId, conceptName, questions, userAnswers } = req.body;
  
  // Check if AI service URL is configured
  const baseUrl = config.aiService.url;
  if (!baseUrl) {
    console.error('AI Service URL not configured. Set PRACTICE_AI_URL or AI_SERVICE_URL environment variable.');
    return sendError(res, 'AI service not configured', 500);
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/practice/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        lesson_id: lessonId,
        concept_name: conceptName,
        questions,
        user_answers: userAnswers
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return sendError(res, data?.detail || 'Failed to evaluate practice', response.status);
    }

    // Update coins and xp in users table
    try {
      const { supabase } = await import('../config/database.js');
      const { data: current, error: curErr } = await supabase
        .from('users')
        .select('xp, coins')
        .eq('id', userId)
        .single();
      if (!curErr && current) {
        const newXp = Math.max(0, (current.xp || 0) + (data.xp_delta || 0));
        const newCoins = Math.max(0, (current.coins || 0) + (data.coins_delta || 0));
        await supabase
          .from('users')
          .update({ xp: newXp, coins: newCoins })
          .eq('id', userId);
      }

      // Insert a practice session record
      await supabase
        .from('practice')
        .insert([{ user_id: userId, lesson_id: lessonId, coins_earned: Math.max(0, data.coins_delta || 0), coins_lost: 0, attempts: questions?.length || 10, last_feedback: data.feedback || null, session_data: { score: data.score, weak_areas: data.weak_areas } }]);
    } catch (dbErr) {
      console.error('Practice evaluation DB update failed:', dbErr);
      // Continue; still return evaluation to client
    }

    return sendSuccess(res, 'Practice evaluated', data);
  } catch (e) {
    console.error('AI evaluate error:', e);
    return sendError(res, 'Failed to evaluate practice', 500);
  }
});

/**
 * Analyze user learning patterns (placeholder)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzeLearningPatterns = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Placeholder for AI learning pattern analysis
  // In the future, this will call the Python FastAPI service with Gemini
  
  const mockAnalysis = {
    userId,
    analysisId: `analysis_${Date.now()}`,
    patterns: {
      learningStyle: "Visual + Analytical",
      strengths: [
        "Strong performance in ratio analysis",
        "Good understanding of financial statements",
        "Consistent practice habits"
      ],
      weaknesses: [
        "Struggles with complex valuation models",
        "Needs improvement in industry comparisons"
      ],
      preferences: {
        preferredContentType: "Interactive examples",
        optimalSessionLength: "15-20 minutes",
        bestTimeOfDay: "Morning sessions"
      }
    },
    recommendations: {
      personalizedPath: [
        "Complete Advanced Valuation Techniques",
        "Focus on Industry Analysis Fundamentals",
        "Practice with DCF modeling scenarios"
      ],
      studyTips: [
        "Use visual aids for complex calculations",
        "Break down problems into smaller steps",
        "Review previous lessons before advancing"
      ],
      practiceFocus: [
        "Multi-period financial analysis",
        "Industry benchmarking exercises",
        "Real-world case studies"
      ]
    },
    insights: {
      progressVelocity: "Above average",
      retentionRate: 0.78,
      engagementLevel: "High",
      predictedCompletionTime: "3-4 weeks"
    },
    aiMetadata: {
      model: "gemini-pro",
      analysisDate: new Date().toISOString(),
      confidence: 0.82,
      dataPoints: 156
    }
  };

  sendSuccess(res, 'Learning patterns analyzed successfully', mockAnalysis);
});

/**
 * Get AI service health status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAIHealth = asyncHandler(async (req, res) => {
  // Placeholder for AI service health check
  // In the future, this will ping the Python FastAPI service
  
  const healthStatus = {
    service: 'FinanceBro AI Integration',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {
      nodejsBackend: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      pythonService: {
        status: 'placeholder',
        endpoint: 'http://localhost:8000',
        lastCheck: new Date().toISOString(),
        note: 'Python FastAPI service not yet implemented'
      },
      geminiAPI: {
        status: 'placeholder',
        lastCheck: new Date().toISOString(),
        note: 'Gemini API integration not yet implemented'
      }
    },
    capabilities: {
      feedbackGeneration: 'ready',
      scenarioGeneration: 'ready',
      patternAnalysis: 'ready',
      contentRecommendation: 'ready'
    }
  };

  sendSuccess(res, 'AI service health check completed', healthStatus);
});
