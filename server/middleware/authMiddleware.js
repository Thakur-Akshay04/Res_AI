const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. No token provided.', 401));
    }

    let clerkEmail;
    let clerkName;
    let clerkUserId;
    let isClerk = false;

    // --- Try Clerk JWT verification first ---
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) throw new Error('Missing CLERK_SECRET_KEY');

      const { createClerkClient, verifyToken } = require('@clerk/backend');
      const clerkClient = createClerkClient({ secretKey: clerkSecretKey });

      const payload = await verifyToken(token, {
        secretKey: clerkSecretKey,
      });

      // Clerk JWT payload: sub = clerkUserId, email in session claims
      clerkUserId = payload.sub;
      if (!clerkUserId) throw new Error('No sub in Clerk token');

      // Fetch user details from Clerk to get their email
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      clerkEmail =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

      clerkName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() ||
        clerkUser.username ||
        clerkEmail?.split('@')[0] ||
        'User';

      isClerk = true;
    } catch (clerkErr) {
      logger.error('Clerk Auth Error: ' + clerkErr.message + '\nStack: ' + clerkErr.stack);
      // Not a Clerk token — fall back to local JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return next(new AppError('User no longer exists.', 401));
        req.user = { id: user._id, name: user.name, email: user.email };
        return next();
      } catch (jwtErr) {
        logger.error('Auth Error (JWT fallback): ' + jwtErr.message);
        return next(new AppError('Not authorized. Invalid token.', 401));
      }
    }

    // --- Clerk path: find or create MongoDB user by email ---
    if (!clerkEmail) {
      return next(new AppError('Could not retrieve email from Clerk token.', 401));
    }

    let user = await User.findOne({ email: clerkEmail }).select('+password');

    if (!user) {
      const flow = req.body?.flow;
      if (flow === 'login') {
        return next(new AppError('No account found with this identity. Please sign up first.', 401));
      }
      user = await User.create({
        name: clerkName,
        email: clerkEmail,
        apiCredits: 50,
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      ...(isClerk && { clerkUserId }),
    };

    next();
  } catch (error) {
    logger.error('Auth Error: ' + error.message);
    return next(new AppError('Not authorized. Invalid token.', 401));
  }
};

module.exports = { protect };
