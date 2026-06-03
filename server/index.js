const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // Also load from cwd for Docker

const requiredEnvVars = ['JWT_SECRET', 'GROQ_API_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please set them in your .env file or deployment environment.');
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const userRoutes = require('./routes/user');
const analysisRoutes = require('./routes/analysis');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const startTime = Date.now();

// Disable Express "X-Powered-By" header to avoid technology fingerprinting
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
}));
app.use(mongoSanitize());
app.use(compression());

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.CLIENT_URL
      ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.path === '/api/health') {
      return next();
    }
    const host = req.headers.host || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return next();
    }

    // Validate Host header against strict RFC-compliant regex to prevent Host Header Injection/Open Redirect
    const isValidHost = /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(host);

    if (req.headers['x-forwarded-proto'] !== 'https') {
      if (isValidHost) {
        return res.redirect(`https://${host}${req.url}`);
      } else {
        logger.warn(`Blocked suspicious HTTP redirect attempt for invalid host: ${host}`);
        return res.status(400).send('Bad Request: Invalid Host Header');
      }
    }
    next();
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', resumeRoutes);
app.use('/api', analysisRoutes);

app.use(errorHandler);

const connectDB = async () => {
  const maxRetries = 5;
  const retryInterval = 3000;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      logger.info(`Connecting to MongoDB... (Attempt ${attempts}/${maxRetries})`);
      await mongoose.connect(process.env.MONGO_URI);
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      logger.warn(`MongoDB connection attempt ${attempts} failed: ${error.message}`);
      if (attempts < maxRetries) {
        logger.info(`Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.warn('All attempts to connect to MongoDB failed. Falling back to in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      logger.info('Connected to in-memory MongoDB (development only)');
      logger.info('⚠ Data will be lost when server restarts. Set MONGO_URI in .env for persistence.');
    } catch (memError) {
      logger.error('Failed to start in-memory MongoDB:', memError.message);
      process.exit(1);
    }
  } else {
    logger.error('All attempts to connect to MongoDB failed. Exiting...');
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    const startServer = (port) => {
      const server = app.listen(port, () => {
        logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Port ${port} is already in use, trying port ${port + 1}...`);
          startServer(port + 1);
        } else {
          logger.error('Server error:', err.message);
          process.exit(1);
        }
      });
    };
    startServer(Number(PORT));
  });
}

module.exports = app;
