import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

export function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const user = db.prepare('SELECT * FROM ADMIN_USERS WHERE username = ?').get(username.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
}

export function getAdminDashboardStats(req, res) {
  try {
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM BOOKINGS').get().count;
    const newBookings = db.prepare("SELECT COUNT(*) as count FROM BOOKINGS WHERE status = 'new'").get().count;
    const confirmedBookings = db.prepare("SELECT COUNT(*) as count FROM BOOKINGS WHERE status = 'confirmed'").get().count;
    const completedBookings = db.prepare("SELECT COUNT(*) as count FROM BOOKINGS WHERE status = 'completed'").get().count;

    const pendingReviews = db.prepare("SELECT COUNT(*) as count FROM REVIEWS WHERE status = 'pending'").get().count;
    const approvedReviews = db.prepare("SELECT COUNT(*) as count FROM REVIEWS WHERE status = 'approved'").get().count;

    const unreadContacts = db.prepare("SELECT COUNT(*) as count FROM CONTACT_MESSAGES WHERE status = 'unread'").get().count;
    const totalContacts = db.prepare('SELECT COUNT(*) as count FROM CONTACT_MESSAGES').get().count;

    const activeTours = db.prepare("SELECT COUNT(*) as count FROM TOURS WHERE status = 'active'").get().count;
    const activeVehicles = db.prepare("SELECT COUNT(*) as count FROM VEHICLES WHERE status = 'active'").get().count;

    // Recent 5 bookings
    const recentBookings = db.prepare('SELECT * FROM BOOKINGS ORDER BY createdAt DESC LIMIT 5').all();
    // Recent 5 reviews
    const recentReviews = db.prepare('SELECT * FROM REVIEWS ORDER BY createdAt DESC LIMIT 5').all();

    return res.json({
      success: true,
      stats: {
        bookings: { total: totalBookings, new: newBookings, confirmed: confirmedBookings, completed: completedBookings },
        reviews: { pending: pendingReviews, approved: approvedReviews },
        contacts: { unread: unreadContacts, total: totalContacts },
        catalog: { tours: activeTours, vehicles: activeVehicles }
      },
      recentBookings,
      recentReviews
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
}

export function getCatalogTours(req, res) {
  try {
    const tours = db.prepare('SELECT * FROM TOURS ORDER BY createdAt ASC').all();
    const formatted = tours.map(t => ({
      ...t,
      highlights: t.highlights ? JSON.parse(t.highlights) : [],
      inclusions: t.inclusions ? JSON.parse(t.inclusions) : [],
      exclusions: t.exclusions ? JSON.parse(t.exclusions) : []
    }));
    return res.json({ success: true, tours: formatted });
  } catch (error) {
    console.error('Error fetching catalog tours:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tours.' });
  }
}

export function getCatalogVehicles(req, res) {
  try {
    const vehicles = db.prepare('SELECT * FROM VEHICLES ORDER BY createdAt ASC').all();
    const formatted = vehicles.map(v => ({
      ...v,
      features: v.features ? JSON.parse(v.features) : []
    }));
    return res.json({ success: true, vehicles: formatted });
  } catch (error) {
    console.error('Error fetching catalog vehicles:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vehicles.' });
  }
}
