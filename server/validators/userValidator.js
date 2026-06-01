const { body } = require('express-validator');

const updateProfileValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('profilePicture')
    .optional({ nullable: true })
];

const emailChangeRequestValidator = [
  body('newEmail')
    .trim()
    .notEmpty().withMessage('New email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
];

const emailVerifyValidator = [
  body('token')
    .notEmpty().withMessage('Verification token is required')
];

const changePasswordValidator = [
  body('currentPassword')
    .custom(async (value, { req }) => {
      const User = require('../models/User');
      const user = await User.findById(req.user.id).select('+password');
      if (user && user.password && !value) {
        throw new Error('Current password is required');
      }
      return true;
    }),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }).withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const deleteAccountValidator = [
  body('password')
    .optional()
    .isString().withMessage('Password must be a string')
];

module.exports = {
  updateProfileValidator,
  emailChangeRequestValidator,
  emailVerifyValidator,
  changePasswordValidator,
  deleteAccountValidator
};
