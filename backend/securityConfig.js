const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const parseAllowedOrigins = () => {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.includes('*')) {
    throw new Error('ALLOWED_ORIGINS must not contain wildcard origins.');
  }

  if (configured.length > 0) {
    return configured;
  }

  return process.env.NODE_ENV === 'production' ? [] : DEFAULT_DEV_ORIGINS;
};

export const allowedOrigins = parseAllowedOrigins();

export const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

export const rejectDisallowedOrigins = (req, res, next) => {
  const origin = req.get('origin');

  if (!isOriginAllowed(origin)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Origin is not allowed by this API.',
    });
  }

  return next();
};

export const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  callback(null, {
    origin: isOriginAllowed(origin),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
    credentials: false,
  });
};

export const helmetOptions = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'no-referrer' },
};
