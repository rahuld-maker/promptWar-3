import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';

const mockVerifyIdToken = vi.fn();

vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('ALLOWED_ORIGINS', 'http://localhost:5173,https://app.example.com');

vi.mock('../firebaseAdmin.js', () => ({
  default: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
  },
}));

vi.mock('../geminiService.js', () => ({
  generateCoachingTips: vi.fn().mockResolvedValue({
    headline: 'Strong progress',
    summary: 'You are saving carbon consistently.',
    tips: [
      { category: 'travel', tip: 'Use the train twice this week.', impact: 'High' },
      { category: 'energy', tip: 'Run fans before air conditioning.', impact: 'Medium' },
      { category: 'food', tip: 'Keep choosing plant-forward meals.', impact: 'Medium' },
    ],
    challenge: 'Make two commute swaps this week.',
    kudos: 'Your travel savings are excellent.',
  }),
}));

vi.mock('express-rate-limit', () => ({
  default: () => (req, res, next) => next(),
}));

let app;

beforeAll(async () => {
  app = (await import('../server.js')).default;
});

beforeEach(() => {
  vi.clearAllMocks();
});

const validUser = {
  uid: 'user-abc',
  email: 'valid@example.com',
  name: 'Valid User',
  picture: '',
};

describe('security middleware', () => {
  it('sets hardened HTTP headers', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://app.example.com');

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('rejects disallowed origins with 403', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });
});

describe('GET /api/health', () => {
  it('returns health metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Carbon Footprint Platform API');
    expect(res.body.version).toBe('2.0.0');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe('POST /api/actions/log', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .post('/api/actions/log')
      .send({ category: 'travel', savings: 1.5 });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 400 for an invalid category', async () => {
    mockVerifyIdToken.mockResolvedValueOnce(validUser);

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'invalidcat', savings: 5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Bad Request');
  });

  it('returns 400 for parameter pollution and unknown fields', async () => {
    mockVerifyIdToken.mockResolvedValueOnce(validUser);

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({
        category: 'energy',
        savings: 5,
        '$where': 'this.savings > 0',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Request body failed validation.');
  });

  it('returns 400 for a savings value exceeding 1000', async () => {
    mockVerifyIdToken.mockResolvedValueOnce(validUser);

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'energy', savings: 9999 });

    expect(res.statusCode).toBe(400);
  });

  it('returns 200 with correct points for a valid request', async () => {
    mockVerifyIdToken.mockResolvedValueOnce(validUser);

    const res = await request(app)
      .post('/api/actions/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ category: 'food', savings: 5.4, description: 'Plant-based meal' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.loggedAction.category).toBe('food');
    expect(res.body.data.loggedAction.savings).toBe(5.4);
    expect(res.body.data.loggedAction.points).toBe(54);
    expect(res.body.data.loggedAction.description).toBe('Plant-based meal');
  });
});

describe('POST /api/coach/tips', () => {
  it('rejects extra fields in nested request objects', async () => {
    mockVerifyIdToken.mockResolvedValueOnce(validUser);

    const res = await request(app)
      .post('/api/coach/tips')
      .set('Authorization', 'Bearer valid-token')
      .send({
        totalSaved: 20,
        totalPoints: 200,
        categoryBreakdown: {
          travel: 10,
          energy: 5,
          food: 3,
          waste: 2,
          shopping: 0,
          polluted: true,
        },
        recentLogs: [],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Request body failed validation.');
  });
});
