const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');

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

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Unable to create account with the provided details', 400));
    }

    const user = await User.create({ name, email, password });
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

    const { identifier, password } = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let user;
    let isAuthenticated = false;

    if (isEmail) {
      const emailLower = identifier.toLowerCase();
      user = await User.findOne({ email: emailLower }).select('+password +loginAttempts +lockUntil');

      if (user && user.isLocked()) {
        return next(new AppError('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.', 423));
      }

      if (user && user.password) {
        isAuthenticated = await user.comparePassword(password);
      }
    } else {
      user = await User.findOne({
        name: { $regex: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).select('+password +loginAttempts +lockUntil');

      if (user && user.isLocked()) {
        return next(new AppError('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.', 423));
      }

      if (user && user.password) {
        isAuthenticated = await user.comparePassword(password);
      }
    }

    if (!user || !isAuthenticated) {
      if (user) {
        await user.incrementLoginAttempts();
      }
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

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset token generated for ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste it into your browser, to complete the process:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n\n` +
      `Note: The link is valid for 15 minutes.\n`;

    const htmlMessage = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You requested to reset your ResuAI password. Click the button below to choose a new password. This link is only valid for 15 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
          If the button above doesn't work, copy and paste this URL into your browser:
        </p>
        <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #374151; margin-bottom: 24px;">
          ${resetUrl}
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

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

    const { token, password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = password;
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
