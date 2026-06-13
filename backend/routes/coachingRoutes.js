/**
 * @file coachingRoutes.js
 * @description Protected API routes for the AI Sustainability Coach.
 * Requires a valid Firebase ID token via the verifyToken middleware.
 */

import { Router } from 'express';
import { verifyToken } from '../authMiddleware.js';
import { generateCoachingTips } from '../geminiService.js';
import { classifyGeminiError } from '../utils/errorHandling.js';
import { logger } from '../utils/logger.js';
import { coachingTipsSchema, validateBody } from '../validation.js';

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
router.post('/tips', verifyToken, validateBody(coachingTipsSchema), async (req, res) => {
  const { totalSaved, totalPoints, categoryBreakdown, recentLogs } = req.body;

  try {
    const userLogsSummary = {
      userName: req.user.name || 'Climate Champion',
      totalSaved,
      totalPoints,
      categoryBreakdown,
      recentLogs,
    };

    logger.info('AI Coach request started', { email: req.user.email, totalSaved, totalPoints });
    const coaching = await generateCoachingTips(userLogsSummary);

    return res.status(200).json({
      success: true,
      data: coaching,
    });
  } catch (error) {
    const classification = classifyGeminiError(error);
    logger.error('AI Coach request failed', { error: error.message, classification });

    return res.status(classification.status).json({
      error: classification.code,
      message: classification.message,
      retryable: classification.retryable,
    });
  }
});

export default router;
