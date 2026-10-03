import express from 'express';
import {
  adminLogin,
  getAdminDashboardStats,
  getCatalogTours,
  getCatalogVehicles
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Login (Brute-force protection: max 10 attempts per 5 min)
router.post('/login', rateLimiter({ windowMs: 300000, maxRequests: 10, message: 'Too many login attempts. Please wait 5 minutes.' }), adminLogin);

// Current admin user info
router.get('/me', authenticateAdmin, (req, res) => {
  return res.json({ success: true, user: req.adminUser });
});

// Admin dashboard KPI summary
router.get('/dashboard-stats', authenticateAdmin, getAdminDashboardStats);

// Catalog endpoints
router.get('/tours', getCatalogTours);
router.get('/vehicles', getCatalogVehicles);

export default router;
