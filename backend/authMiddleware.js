import admin from './firebaseAdmin.js';

/**
 * Express middleware to verify the Firebase ID Token.
 * Expects a header: Authorization: Bearer <Token>
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: No token provided in Authorization header.'
    });
  }

  // 2. Verify Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: Malformed token header. Format must be "Bearer <Token>".'
    });
  }

  // 3. Extract the token
  const [, token, extra] = authHeader.trim().split(/\s+/);

  if (!token || extra) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: Bearer token is missing or malformed.'
    });
  }

  try {
    // 4. Verify ID Token with Firebase Admin and reject revoked tokens.
    const decodedToken = await admin.auth().verifyIdToken(token, true);

    if (!decodedToken.uid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access Denied: Invalid authentication token.',
      });
    }
    
    // 5. Attach decoded user attributes to request context
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || ''
    };

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.code || error.message);

    // Provide specific guidance for expired tokens vs other auth faults
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access Denied: Firebase ID Token has expired. Please refresh credentials.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'auth/id-token-revoked' || error.code === 'auth/user-disabled') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access Denied: User session is no longer valid.',
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access Denied: Invalid authentication token.'
    });
  }
};
