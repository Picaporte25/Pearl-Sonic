// Simple in-memory rate limiting middleware
// Limits the number of requests per IP address

const rateLimitMap = new Map();

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  // Login/Register: 5 attempts per 15 minutes
  auth: { max: 5, windowMs: 15 * 60 * 1000 },
  // Webhooks: 10 requests per minute (from Paddle)
  webhook: { max: 10, windowMs: 60 * 1000 },
  // Music generation: 5 requests per minute
  generate: { max: 5, windowMs: 60 * 1000 },
  // General API: 100 requests per minute
  general: { max: 100, windowMs: 60 * 1000 },
};

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  // Try various headers for IP (in case of proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can have multiple IPs: "client, proxy1, proxy2"
    return forwardedFor.split(',')[0].trim();
  }

  return realIp || cfConnectingIp || req.socket?.remoteAddress || 'unknown';
}

/**
 * Check if request should be rate limited
 * @param {string} type - The type of rate limit (auth, webhook, generate, general)
 * @param {object} req - Express request object
 * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(type, req) {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.general;
  const ip = getClientIp(req);
  const key = `${type}:${ip}`;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up old entries
  for (const [existingKey, existingValue] of rateLimitMap.entries()) {
    if (existingValue.timestamp < windowStart) {
      rateLimitMap.delete(existingKey);
    }
  }

  // Get current rate limit for this key
  const current = rateLimitMap.get(key) || {
    count: 0,
    timestamp: now,
  };

  // Check if the window has expired
  if (current.timestamp < windowStart) {
    current.count = 0;
    current.timestamp = now;
  }

  // Increment counter
  current.count += 1;
  current.timestamp = now;

  // Store updated value
  rateLimitMap.set(key, current);

  // Calculate remaining requests
  const remaining = Math.max(0, config.max - current.count);
  const resetTime = current.timestamp + config.windowMs;

  return {
    allowed: remaining > 0,
    remaining,
    resetTime,
    limit: config.max,
  };
}

/**
 * Rate limiting middleware factory
 * @param {string} type - The type of rate limit
 * @returns {function} - Express middleware
 */
export function rateLimit(type) {
  return (req, res, next) => {
    const result = checkRateLimit(type, req);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      });
    }

    next();
  };
}

/**
 * Clean up old rate limit entries periodically
 * Should be called periodically (e.g., every hour)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  for (const [key, value] of rateLimitMap.entries()) {
    if (value.timestamp < now - maxAge) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 10 * 60 * 1000);
}
