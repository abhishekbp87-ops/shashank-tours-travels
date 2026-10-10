/**
 * Lightweight in-memory rate limiter per IP with isolated route buckets and auto-cleanup
 * @param {object} options
 * @param {number} [options.windowMs=60000] - Time window in milliseconds
 * @param {number} [options.maxRequests=10] - Maximum allowed requests within window
 * @param {string} [options.message='Too many requests. Please try again in a minute.'] - Error message if exceeded
 */
export function rateLimiter({ windowMs = 60000, maxRequests = 10, message = 'Too many requests. Please try again in a minute.' } = {}) {
  // Scoped per-route map to prevent cross-endpoint rate limit collisions
  const routeLimits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks from expired IP records
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of routeLimits.entries()) {
      if (now > record.resetTime) {
        routeLimits.delete(ip);
      }
    }
  }, 300000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req, res, next) => {
    // Derive client IP cleanly
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const now = Date.now();

    const record = routeLimits.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    routeLimits.set(ip, record);

    const isProd = process.env.NODE_ENV === 'production';
    const effectiveMax = isProd ? maxRequests : Math.max(maxRequests, 100);

    if (record.count > effectiveMax) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}
