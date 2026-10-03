const rateLimits = new Map();

/**
 * Lightweight in-memory rate limiter per IP
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum allowed requests within window
 * @param {string} message - Error message if exceeded
 */
export function rateLimiter({ windowMs = 60000, maxRequests = 10, message = 'Too many requests. Please try again in a minute.' }) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimits.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}
