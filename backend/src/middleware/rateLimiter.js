const rateLimit = require('express-rate-limit');

// Rate limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for complaint submission (anonymous abuse prevention)
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many reports submitted. Please try again after 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!req.user, // skip for authenticated users
});

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

module.exports = { authLimiter, reportLimiter, generalLimiter };
