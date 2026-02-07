const rateLimit = require('express-rate-limit');

const requestAccessLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, try again later.' },
  },
});

module.exports = { requestAccessLimiter };
