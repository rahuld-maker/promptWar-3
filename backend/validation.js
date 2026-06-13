import { z } from 'zod';

const categories = ['travel', 'energy', 'food', 'waste', 'shopping'];

const finiteCarbonNumber = z.coerce
  .number()
  .finite()
  .min(0)
  .max(1000);

const cleanText = z
  .string()
  .trim()
  .min(1)
  .max(240)
  .regex(/^[\p{L}\p{N}\s.,:;'"!?()&/+-]+$/u, 'contains unsupported characters');

export const actionLogSchema = z
  .object({
    category: z.enum(categories),
    savings: finiteCarbonNumber,
    description: cleanText.optional(),
  })
  .strict();

const categoryBreakdownSchema = z
  .object({
    travel: finiteCarbonNumber,
    energy: finiteCarbonNumber,
    food: finiteCarbonNumber,
    waste: finiteCarbonNumber,
    shopping: finiteCarbonNumber,
  })
  .strict();

const recentLogSchema = z
  .object({
    category: z.enum(categories),
    description: cleanText.max(180),
    savings: finiteCarbonNumber,
    points: z.coerce.number().int().min(0).max(10000).optional(),
    date: z.string().trim().max(40).optional(),
    id: z.string().trim().max(80).optional(),
  })
  .strict();

export const coachingTipsSchema = z
  .object({
    totalSaved: finiteCarbonNumber,
    totalPoints: z.coerce.number().int().min(0).max(1000000),
    categoryBreakdown: categoryBreakdownSchema,
    recentLogs: z.array(recentLogSchema).max(5),
  })
  .strict();

const formatIssues = (issues) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Request body failed validation.',
      issues: formatIssues(result.error.issues),
    });
  }

  req.body = result.data;
  return next();
};
