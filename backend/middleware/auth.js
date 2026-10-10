import jwt from 'jsonwebtoken';

const DEFAULT_FALLBACK_SECRET = 'shashank_tours_travels_secure_jwt_secret_key_2026';
const isProd = process.env.NODE_ENV === 'production';

// Strict validation of JWT_SECRET
if (isProd) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_FALLBACK_SECRET) {
    console.error('FATAL [SECURITY]: In production (NODE_ENV=production), a unique and secure JWT_SECRET environment variable is strictly required. The application refuses to start with an unset or default fallback secret.');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('FATAL [SECURITY]: JWT_SECRET in production must be at least 32 characters long to ensure cryptographic integrity.');
    process.exit(1);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_FALLBACK_SECRET;

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to the admin portal.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Explicitly pin algorithm to HS256 to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.adminUser = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}
