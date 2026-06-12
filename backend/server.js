/**
 * @file server.js
 * @description Main Express server entry point for the Carbon Footprint Platform API.
 * Implements CORS security, rate limiting, JWT auth middleware, and all API routes.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './authMiddleware.js';
import coachingRoutes from './routes/coachingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Load allowed origins from environment to avoid hardcoding
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors((req, callback) => {
    const origin = req.header('Origin');
    const host = req.get('host');
    let allowed = false;

    if (!origin) {
      allowed = true;
    } else if (origin.startsWith('http://localhost:')) {
      allowed = true;
    } else if (allowedOrigins.includes(origin)) {
      allowed = true;
    } else {
      try {
        const originHost = new URL(origin).host;
        if (originHost === host) {
          allowed = true;
        }
      } catch (err) {
        // Safe fallback for malformed URLs
      }
    }

    const corsOptions = {
      origin: allowed,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    if (!allowed) {
      console.warn(`[CORS Blocked] Origin "${origin}" does not match Host "${host}"`);
    }

    callback(null, corsOptions);
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// General API limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Rate limit exceeded. Please wait 15 minutes.' },
});

// Stricter AI endpoint limiter: 10 requests per 15 minutes (Gemini API is costly)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'AI Coach limit reached. Please wait before requesting more tips.' },
});

// Apply general limiter to all /api routes
app.use('/api', apiLimiter);

// Apply stricter limiter to AI coach route
app.use('/api/coach', aiLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' })); // Limit body size to prevent large payload attacks

// ─── Routes ──────────────────────────────────────────────────────────────────

// Public healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Carbon Footprint Platform API',
    version: '2.0.0',
  });
});

// Protected Route: Log an action
app.post('/api/actions/log', verifyToken, (req, res) => {
  const { category, savings, description } = req.body;

  // Validate and sanitize inputs
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
  console.log(`[DB Transaction] Saving carbon log for: ${name} (${email})`);
  console.log(`  - Action: ${description || category} | Saves: ${parsedSavings} kg CO2eq`);

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

// Mount AI Coach routes at /api/coach
app.use('/api/coach', coachingRoutes);

// ─── Serve React Static Files ────────────────────────────────────────────────
// Serve the compiled frontend build folder
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to React index.html for React Router routing (except for API requests)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Unhandled Server Error]', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`  Carbon Footprint Platform API v2.0              `);
  console.log(`  Listening on: http://0.0.0.0:${PORT}            `);
  console.log(`  Health:       http://0.0.0.0:${PORT}/api/health`);
  console.log(`==================================================`);
});
