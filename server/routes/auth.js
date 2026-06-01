
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, clerkSync } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

// Legacy custom password auth routes (still supported as fallback)
router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, resetPassword);

// Clerk identity sync — called once after Clerk sign-in to hydrate MongoDB user profile
router.post('/clerk-sync', protect, clerkSync);

module.exports = router;
