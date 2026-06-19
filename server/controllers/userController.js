const { validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const { generateToken } = require('./authController');
const { getNextMidnightUTC } = require('../utils/aiHelper');

// Safe O(n) email masker — avoids the ReDoS-prone /(.{2}).*(@.*)/ regex pattern
// where two overlapping .* quantifiers cause catastrophic backtracking on inputs
// that contain no '@' character.
const maskEmail = (email) => {
  const str = String(email);
  const atIdx = str.indexOf('@');
  if (atIdx < 0) return '**';
  return str.slice(0, Math.min(2, atIdx)) + '***' + str.slice(atIdx);
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { name, profilePicture, github, linkedin, portfolio } = req.body;
    let updateFields = { name: name.trim() };

    if (github !== undefined) updateFields.github = github ? github.trim() : null;
    if (linkedin !== undefined) updateFields.linkedin = linkedin ? linkedin.trim() : null;
    if (portfolio !== undefined) updateFields.portfolio = portfolio ? portfolio.trim() : null;

    if (profilePicture !== undefined) {
      if (profilePicture === null) {
        updateFields.profilePicture = null;
      } else if (typeof profilePicture === 'string' && profilePicture.startsWith('data:image/')) {
        const sizeInBytes = Buffer.byteLength(profilePicture, 'utf8');
        if (sizeInBytes > 500 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Image too large. Max 500KB.'
          });
        }
        updateFields.profilePicture = profilePicture;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format.'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('+password');

    if (!user) return next(new AppError('User not found', 404));

    logger.info({ message: 'Profile updated', email: maskEmail(user.email) });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          github: user.github || null,
          linkedin: user.linkedin || null,
          portfolio: user.portfolio || null,
          createdAt: user.createdAt,
          hasPassword: !!user.password
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const requestEmailChange = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { newEmail } = req.body;

    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use.'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));

    const token = user.createEmailChangeToken();
    user.pendingEmail = newEmail.toLowerCase();

    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
    const verifyLink = `${clientUrl}/profile/verify-email?token=${token}`;

    logger.info({ message: 'Email change requested', from: maskEmail(user.email), to: maskEmail(user.pendingEmail) });

    try {
      const { getEmailChangeTemplate } = require('../utils/emailTemplates');
      await sendEmail({
        email: user.pendingEmail,
        subject: 'ResuCraft - Verify Your New Email Address',
        message: `You requested to change your email. Click the link to verify: ${verifyLink}\n\nThis link expires in 15 minutes.`,
        html: getEmailChangeTemplate(verifyLink)
      });
    } catch (emailErr) {
      logger.error({ message: 'Error sending email change verification', error: emailErr.message });
    }

    res.json({
      success: true,
      message: 'A verification link has been sent to your new email address. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailChange = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { token } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      _id: req.user.id,
      emailChangeToken: hashedToken,
      emailChangeExpires: { $gt: Date.now() }
    }).select('+emailChangeToken +emailChangeExpires +pendingEmail');

    if (!user || !user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link.'
      });
    }

    const oldEmail = user.email;
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;

    await user.save();

    logger.info({ message: 'Email successfully changed', userId: String(user._id) });

    res.json({
      success: true,
      message: 'Email updated successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    const hadPassword = !!user.password;

    if (hadPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change your password.'
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password.'
        });
      }
    }

    // Atomic single-step password update (safe if server crashes mid-operation)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    logger.info({ message: hadPassword ? 'Password changed' : 'Password set', userId: String(user._id) });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: hadPassword ? 'Password changed successfully' : 'Password set successfully',
      data: {
        token,
        hasPassword: true
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    if (user.password) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account.'
        });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Account deletion cancelled.'
        });
      }
    }

    // If the request was authenticated via Clerk, delete their Clerk account too
    if (req.user.clerkUserId) {
      const { createClerkClient } = require('@clerk/backend');
      const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      try {
        await clerkClient.users.deleteUser(req.user.clerkUserId);
        logger.info({ message: 'User deleted from Clerk', clerkUserId: String(req.user.clerkUserId) });
      } catch (clerkDelErr) {
        logger.error({ message: 'Failed to delete user from Clerk', error: clerkDelErr.message });
        // We proceed with local deletion even if Clerk deletion fails to avoid keeping orphaned local data.
      }
    }

    // Delete all associated data
    const deletedResumes = await Resume.deleteMany({ userId: user._id });
    logger.info({ message: 'Resumes deleted', count: deletedResumes.deletedCount, userId: String(user._id) });

    const deletedReports = await AnalysisReport.deleteMany({ userId: user._id });
    logger.info({ message: 'Analysis reports deleted', count: deletedReports.deletedCount, userId: String(user._id) });

    await User.findByIdAndDelete(user._id);
    logger.info({ message: 'Account permanently deleted', userId: String(user._id) });

    res.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return next(new AppError('User not found', 404));

    res.json({
      success: true,
      data: {
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

const getGroqStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const lastReset = user.lastTokenResetDate ? new Date(user.lastTokenResetDate) : new Date(0);

    const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCFullYear() !== lastReset.getUTCFullYear();

    if (isNewDay) {
      user.dailyTokensUsed = 0;
      user.lastTokenResetDate = now;
      await user.save();
    }

    const dailyLimit = 100000;
    const dailyRemaining = Math.max(0, dailyLimit - (user.dailyTokensUsed || 0));

    const dailyResetAt = getNextMidnightUTC();

    const msLeft = new Date(dailyResetAt).getTime() - Date.now();
    const hLeft = Math.max(0, Math.floor(msLeft / 3600000));
    const mLeft = Math.max(0, Math.floor((msLeft % 3600000) / 60000));
    const resetAt = `${hLeft}h ${mLeft}m`;

    res.json({
      success: true,
      data: {
        tokensRemaining: dailyRemaining,
        tokensLimit: dailyLimit,
        dailyRemaining: dailyRemaining,
        dailyLimit: dailyLimit,
        resetAt: resetAt,
        dailyResetAt: dailyResetAt,
        lastUpdated: new Date().toISOString(),
        model: 'llama-3.3-70b-versatile'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  deleteAccount,
  getMe,
  getGroqStatus
};
