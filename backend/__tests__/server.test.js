/**
 * @file server.test.js
 * @description Integration-style unit tests for the Express server routes.
 * Uses Vitest with supertest to test /api/health and /api/actions/log endpoints.
 * Firebase Admin is mocked — no real external calls are made.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

// ─── Shared mock for verifyIdToken ─────────────────────────────────────────────
const mockVerifyIdToken = vi.fn();

vi.mock('../firebaseAdmin.js', () => ({
  default: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
  },
}));

// Mock coachingRoutes to avoid deep dependency chains in these tests
vi.mock('../routes/coachingRoutes.js', () => ({
  default: (req, res, next) => next(),
}));

// Disable rate limiting in tests to prevent 429 interference
vi.mock('express-rate-limit', () => ({
  default: () => (req, res, next) => next(),
}));

// ─── Build testable app ────────────────────────────────────────────────────────
let app;

beforeAll(async () => {
  const { verifyToken } = await import('../authMiddleware.js');

  app = express();
  app.use(cors());
  app.use(express.json());

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Carbon Footprint Platform API',
      version: '2.0.0',
    });
  });

  // Log action route (mirrors production logic)
  app.post('/api/actions/log', verifyToken, (req, res) => {
    const { category, savings, description } = req.body;

    const validCategories = ['travel', 'energy', 'food', 'waste', 'shopping'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const parsedSavings = parseFloat(savings);
    if (isNaN(parsedSavings) || parsedSavings < 0 || parsedSavings > 1000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid savings value. Must be a number between 0 and 1000.',
      });
    }

    const { uid, name, email } = req.user;
    const calculatedPoints = Math.round(parsedSavings * 10);

    return res.status(200).json({
      success: true,
      message: 'Carbon footprint action recorded successfully.',
      data: {
        userId: uid,
        userName: name,
        userEmail: email,
        loggedAction: {
          category,
          savings: parsedSavings,
          points: calculatedPoints,
          description: description || `Saved carbon in ${category} category`,
          timestamp: new Date().toISOString(),
        },
      },
    });
  });
});

// ─── GET /api/health ──────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return 200 with a healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should include service name and version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.service).toBe('Carbon Footprint Platform API');
    expect(res.body.version).toBe('2.0.0');
  });

  it('should include a valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

// ─── POST /api/actions/log ────────────────────────────────────────────────────
describe('POST /api/actions/log', () => {
  it('should return 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/actions/log')
      .send({ category: 'travel', savings: 1.5 });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should return 400 for an invalid category', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'u1', email: 'test@example.com', name: 'Tester', picture: '',
    });

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'invalidcat', savings: 5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Bad Request');
  });

  it('should return 400 for a savings value exceeding 1000', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'u2', email: 'test2@example.com', name: 'Tester2', picture: '',
    });

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'energy', savings: 9999 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('between 0 and 1000');
  });

  it('should return 200 with correct points for a valid request', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'user-abc', email: 'valid@example.com', name: 'Valid User', picture: '',
    });

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'food', savings: 5.4, description: 'Plant-based meal' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.loggedAction.category).toBe('food');
    expect(res.body.data.loggedAction.savings).toBe(5.4);
    // points = Math.round(5.4 * 10) = 54
    expect(res.body.data.loggedAction.points).toBe(54);
    expect(res.body.data.loggedAction.description).toBe('Plant-based meal');
  });

  it('should use a default description when description is omitted', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'user-xyz', email: 'desc@example.com', name: 'No Desc User', picture: '',
    });

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'waste', savings: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.loggedAction.description).toBe('Saved carbon in waste category');
  });
});
