/**
 * @file server.js
 * @description Main Express server entry point for the Carbon Footprint Platform API.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './authMiddleware.js';
import coachingRoutes from './routes/coachingRoutes.js';
import { actionLogSchema, validateBody } from './validation.js';
import { corsOptionsDelegate, helmetOptions, rejectDisallowedOrigins } from './securityConfig.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet(helmetOptions));
app.use(rejectDisallowedOrigins);
app.use(cors(corsOptionsDelegate));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Rate limit exceeded. Please wait 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'AI Coach limit reached. Please wait before requesting more tips.' },
});

app.use('/api', apiLimiter);
app.use('/api/coach', aiLimiter);
app.use(express.json({ limit: '100kb', strict: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Carbon Footprint Platform API',
    version: '2.0.0',
  });
});

app.post('/api/actions/log', verifyToken, validateBody(actionLogSchema), (req, res) => {
  const { category, savings, description } = req.body;
  const { uid, name, email } = req.user;
  const calculatedPoints = Math.round(savings * 10);

  logger.info('Saving carbon log event', { name, email, category, savings, description });

  return res.status(200).json({
    success: true,
    message: 'Carbon footprint action recorded successfully.',
    data: {
      userId: uid,
      userName: name,
      userEmail: email,
      loggedAction: {
        category,
        savings,
        points: calculatedPoints,
        description: description || `Saved carbon in ${category} category`,
        timestamp: new Date().toISOString(),
      },
    },
  });
});

app.use('/api/coach', coachingRoutes);
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, _next) => {
  logger.error('Unhandled server error', { path: req.originalUrl, message: err.message, stack: err.stack });

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Bad Request', message: 'Malformed JSON request body.' });
  }

  return res.status(500).json({ error: 'Internal Server Error', message: 'Unexpected server error.' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info('Carbon Footprint Platform API ready', {
      port: PORT,
      health: `http://0.0.0.0:${PORT}/api/health`,
    });
  });
}

export default app;
