const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');
const { getPasswordResetTemplate } = require('../utils/emailTemplates');

const maskEmail = (email) => {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? name.slice(0, 2) + '***' : name + '***';
  return `${maskedName}@${domain}`;
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const emailStr = String(req.body.email).toLowerCase();
    const passwordStr = String(req.body.password);
    const nameStr = String(req.body.name);

    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      return next(new AppError('Unable to create account with the provided details', 400));
    }

    const user = await User.create({ name: nameStr, email: emailStr, password: passwordStr });
    const token = generateToken(user._id);


    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          apiCredits: user.apiCredits,
          createdAt: user.createdAt,
          hasPassword: true
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};



const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const safeIdentifier = String(req.body.identifier);
    const passwordStr = String(req.body.password);

    // Enforce input length limit to completely prevent high-complexity lookup operations
    if (safeIdentifier.length > 254) {
      return next(new AppError('Invalid credentials format', 400));
    }

    // Solve ReDoS vulnerability completely without regular expressions (using linear O(n) index matching)
    const isEmail = safeIdentifier.includes('@') && safeIdentifier.indexOf('.') > safeIdentifier.indexOf('@');

    let user;

    if (isEmail) {
      const emailLower = safeIdentifier.toLowerCase();
      user = await User.findOne({ email: emailLower }).select('+password +loginAttempts +lockUntil');
    } else {
      const escapedName = safeIdentifier.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
      user = await User.findOne({
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
      }).select('+password +loginAttempts +lockUntil');
    }

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (user.isLocked()) {
      return next(new AppError('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.', 423));
    }

    const isAuthenticated = user.password ? await user.comparePassword(passwordStr) : false;

    if (!isAuthenticated) {
      await user.incrementLoginAttempts();
      return next(new AppError('Invalid credentials', 401));
    }

    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          github: user.github || null,
          linkedin: user.linkedin || null,
          portfolio: user.portfolio || null,
          apiCredits: user.apiCredits,
          createdAt: user.createdAt,
          hasPassword: !!user.password
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const emailStr = String(req.body.email).toLowerCase();
    const user = await User.findOne({ email: emailStr });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset token generated for ${maskEmail(emailStr)}`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste it into your browser, to complete the process:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n\n` +
      `Note: The link is valid for 15 minutes.\n`;

    const htmlMessage = getPasswordResetTemplate(resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'ResuAI - Password Reset Request',
        message,
        html: htmlMessage
      });
    } catch (err) {
      logger.error(`Error sending password reset email to ${user.email}: ${err.message}`);
    }

    const response = {
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
      expiresIn: '15 minutes'
    };

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      response.resetToken = resetToken;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const tokenStr = String(req.body.token);
    const passwordStr = String(req.body.password);

    const hashedToken = crypto
      .createHash('sha256')
      .update(tokenStr)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = passwordStr;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    logger.info(`Password reset successful for ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful. You are now logged in.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          apiCredits: user.apiCredits,
          createdAt: user.createdAt,
          hasPassword: true
        },
        token: authToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const clerkSync = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
        github: user.github || null,
        linkedin: user.linkedin || null,
        portfolio: user.portfolio || null,
        apiCredits: user.apiCredits,
        createdAt: user.createdAt,
        hasPassword: !!user.password
      }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = { register, login, forgotPassword, resetPassword, clerkSync, generateToken };
