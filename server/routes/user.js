const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  deleteAccount,
  getMe,
  getGroqStatus
} = require('../controllers/userController');
const {
  updateProfileValidator,
  emailChangeRequestValidator,
  emailVerifyValidator,
  changePasswordValidator,
  deleteAccountValidator
} = require('../validators/userValidator');

router.use(protect);

router.get('/me', getMe);
router.get('/groq-status', getGroqStatus);
router.put('/profile', updateProfileValidator, updateProfile);
router.post('/email/request-change', authLimiter, emailChangeRequestValidator, requestEmailChange);
router.post('/email/verify', authLimiter, emailVerifyValidator, verifyEmailChange);
router.put('/password', authLimiter, changePasswordValidator, changePassword);
router.delete('/account', authLimiter, deleteAccountValidator, deleteAccount);

module.exports = router;
