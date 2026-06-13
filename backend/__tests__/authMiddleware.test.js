/**
 * @file authMiddleware.test.js
 * @description Unit tests for the verifyToken Express middleware.
 * Firebase Admin SDK is mocked so no real Firebase connection is required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Shared mock for verifyIdToken ────────────────────────────────────────────
// We define the mock function at module scope so all calls to admin.auth().verifyIdToken
// reference the SAME function, making mockResolvedValueOnce work correctly.
const mockVerifyIdToken = vi.fn();

vi.mock('../firebaseAdmin.js', () => ({
  default: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
    }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mockReq(headers = {}) {
  return { headers };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// ─── Import after mocks ───────────────────────────────────────────────────────
const { verifyToken } = await import('../authMiddleware.js');

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('verifyToken Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    res = mockRes();
    next = vi.fn();
  });

  it('should return 401 when Authorization header is missing', async () => {
    req = mockReq({});
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is not Bearer format', async () => {
    req = mockReq({ authorization: 'Basic somebase64token' });
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Bearer token segment is empty', async () => {
    req = mockReq({ authorization: 'Bearer ' });
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and set req.user when token is valid', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
    });

    req = mockReq({ authorization: 'Bearer valid-token-string' });
    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token-string', true);
    expect(req.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 with TOKEN_EXPIRED code for expired tokens', async () => {
    const expiredError = new Error('Firebase ID token has expired.');
    expiredError.code = 'auth/id-token-expired';
    mockVerifyIdToken.mockRejectedValueOnce(expiredError);

    req = mockReq({ authorization: 'Bearer expired-token' });
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TOKEN_EXPIRED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for any other invalid token error', async () => {
    const invalidError = new Error('Decoding Firebase ID token failed.');
    invalidError.code = 'auth/argument-error';
    mockVerifyIdToken.mockRejectedValueOnce(invalidError);

    req = mockReq({ authorization: 'Bearer bad-token' });
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 for revoked tokens', async () => {
    const revokedError = new Error('Firebase ID token has been revoked.');
    revokedError.code = 'auth/id-token-revoked';
    mockVerifyIdToken.mockRejectedValueOnce(revokedError);

    req = mockReq({ authorization: 'Bearer revoked-token' });
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should use email prefix as name when name is not in token', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({
      uid: 'user-456',
      email: 'noname@example.com',
      picture: '',
      // name intentionally missing
    });

    req = mockReq({ authorization: 'Bearer valid-no-name-token' });
    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user.name).toBe('noname');
  });
});
