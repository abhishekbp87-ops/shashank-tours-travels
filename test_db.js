import { initDatabase } from './backend/config/database.js';
import db from './backend/config/database.js';

// Initialize database (creates tables if not exist)
initDatabase();

// Test a simple query
try {
    const result = db.prepare('SELECT COUNT(*) as count FROM CUSTOMERS').get();
    console.log('Database connection successful. Customer count:', result.count);
} catch (err) {
    console.error('Database error:', err);
}