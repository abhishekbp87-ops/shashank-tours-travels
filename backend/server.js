import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './config/database.js';

import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 1. Initialize SQLite Database & Tables
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Reverse-Proxy Trust Configuration
// Do not blindly trust all hops. When behind local Nginx/Caddy, trust 'loopback'.
// If accessed directly (standalone), trust is disabled (false) to prevent X-Forwarded-For IP spoofing.
const isProd = process.env.NODE_ENV === 'production';
const trustProxyConfig = process.env.TRUST_PROXY || (isProd ? 'loopback' : false);
app.set('trust proxy', trustProxyConfig);

// 3. Strict CORS Middleware
// Production requires explicit origin matching; wildcards are strictly disallowed in production.
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  : [];

const devAllowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

if (isProd && configuredOrigins.length === 0) {
  console.warn('⚠️  [SECURITY]: In production, ALLOWED_ORIGINS is not configured. Cross-origin browser requests will be blocked. Same-origin and direct API requests remain permitted.');
}

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no Origin header (same-origin static assets, curl, server-to-server, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.toLowerCase().trim();

    // 2. In Production: strictly match against configured production origins (never wildcard *)
    if (isProd) {
      if (configuredOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      // Block unlisted origin without crashing the request stream
      return callback(null, false);
    }

    // 3. In Development: allow local dev servers, configured origins, or explicit loopbacks
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(normalizedOrigin) ||
      devAllowedOrigins.includes(normalizedOrigin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Health Endpoint (Phase 5)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Shashank Tours & Travels Production API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 4. API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

const HOST = process.env.HOST || '0.0.0.0';

// 5. Serve Admin SPA / Static Frontend in Production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/admin', (req, res, next) => {
    const adminPath = path.join(distPath, 'admin.html');
    if (fs.existsSync(adminPath)) {
      return res.sendFile(adminPath);
    }
    next();
  });
}

// 6. Global Error Handler (Never leak stack traces to client)
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred. Please try again or contact customer support.'
  });
});

// 7. Start Server
app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`  SHASHANK TOURS & TRAVELS — PRODUCTION API SERVER`);
  console.log(`  Status: Running on http://${HOST}:${PORT}`);
  console.log(`  Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;
