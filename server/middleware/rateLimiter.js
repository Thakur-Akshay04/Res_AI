const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    }
  });
};

const generateLimiter = createLimiter(60 * 60 * 1000, 10, 'Too many generation requests. Please try again in an hour.');
const scoreLimiter = createLimiter(60 * 60 * 1000, 20, 'Too many scoring requests. Please try again in an hour.');
const authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many login attempts. Please try again later.');
const analyzeLimiter = createLimiter(60 * 60 * 1000, 30, 'Too many analysis requests. Please try again in an hour.');
const publicLimiter = createLimiter(15 * 60 * 1000, 60, 'Too many requests. Please try again later.');

module.exports = { generateLimiter, scoreLimiter, authLimiter, analyzeLimiter, publicLimiter };
