/**
 * @file coachingRoutes.js
 * @description Protected API routes for the AI Sustainability Coach.
 * Requires a valid Firebase ID token via the verifyToken middleware.
 */

import { Router } from 'express';
import { verifyToken } from '../authMiddleware.js';
import { generateCoachingTips } from '../geminiService.js';

const router = Router();

/**
 * POST /api/coach/tips
 * Protected: Requires Authorization Bearer token.
 *
 * Body: {
 *   totalSaved: number,
 *   totalPoints: number,
 *   categoryBreakdown: { travel, energy, food, waste, shopping },
 *   recentLogs: Array<{ category, description, savings }>
 * }
 */
router.post('/tips', verifyToken, async (req, res) => {
  const { totalSaved, totalPoints, categoryBreakdown, recentLogs } = req.body;

  // --- Input Validation ---
  if (
    typeof totalSaved !== 'number' ||
    typeof totalPoints !== 'number' ||
    typeof categoryBreakdown !== 'object' ||
    !Array.isArray(recentLogs)
  ) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing or invalid fields: totalSaved, totalPoints, categoryBreakdown, recentLogs are required.',
    });
  }

  try {
    const userLogsSummary = {
      userName: req.user.name || 'Climate Champion',
      totalSaved,
      totalPoints,
      categoryBreakdown,
      recentLogs,
    };

    console.log(`[AI Coach] Generating tips for user: ${req.user.email}`);
    const coaching = await generateCoachingTips(userLogsSummary);

    return res.status(200).json({
      success: true,
      data: coaching,
    });
  } catch (err) {
    console.error('[AI Coach Error]', err.message);

    // Distinguish API key errors from other issues
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'The AI Coach service is not configured. Please add GEMINI_API_KEY to backend .env.',
      });
    }

    // Handle quota exceeded errors
    if (err.message.includes('429') || err.message.includes('quota') || err.message.includes('Too Many Requests')) {
      return res.status(429).json({
        error: 'Quota Exceeded',
        message: 'Gemini API free-tier quota exceeded for today. The AI Coach will be available again tomorrow, or upgrade your API plan at aistudio.google.com.',
      });
    }

    // Handle invalid model errors
    if (err.message.includes('404') || err.message.includes('not found')) {
      return res.status(503).json({
        error: 'Model Unavailable',
        message: 'The AI model is temporarily unavailable. Please try again in a few minutes.',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'The AI Coach failed to generate tips. Please try again later.',
    });
  }
});

export default router;
