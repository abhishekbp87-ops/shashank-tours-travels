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

// 2. Core Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
