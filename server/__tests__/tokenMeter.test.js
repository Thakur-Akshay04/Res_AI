// Integration and unit tests for persistent per-user daily token meter

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const { trackTokensUsed } = require('../utils/aiHelper');

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Persistent Daily Token Meter API and Logic', () => {
  const testUser = {
    name: 'Token Tester',
    email: 'tokentest@example.com',
    password: 'Password123!',
  };

  it('should initialize a new user with 100.0k tokens remaining (0 tokens used)', async () => {
    // 1. Register a new user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const token = regRes.body.data.token;
    expect(token).toBeDefined();

    // 2. Fetch the groq status (token meter data)
    const statusRes = await request(app)
      .get('/api/user/groq-status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statusRes.body.success).toBe(true);
    expect(statusRes.body.data.tokensRemaining).toBe(100000);
    expect(statusRes.body.data.tokensLimit).toBe(100000);
    expect(statusRes.body.data.dailyRemaining).toBe(100000);
    expect(statusRes.body.data.dailyLimit).toBe(100000);
    expect(statusRes.body.data.resetAt).toBeDefined();
    expect(statusRes.body.data.dailyResetAt).toBeDefined();
  });

  it('should decrease the remaining tokens correctly when trackTokensUsed is called', async () => {
    // 1. Register and get token
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const token = regRes.body.data.token;
    const userId = regRes.body.data.user.id;

    // 2. Simulate AI consumption of 5500 tokens
    await trackTokensUsed(userId, 5500);

    // 3. Verify in DB
    const dbUser = await User.findById(userId);
    expect(dbUser.dailyTokensUsed).toBe(5500);

    // 4. Fetch the groq status API and check deduction
    const statusRes = await request(app)
      .get('/api/user/groq-status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statusRes.body.data.tokensRemaining).toBe(94500); // 100000 - 5500
    expect(statusRes.body.data.dailyRemaining).toBe(94500);
    expect(statusRes.body.data.dailyLimit).toBe(100000);
  });

  it('should persist remaining tokens after logging out and logging back in', async () => {
    // 1. Register and get token
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const userId = regRes.body.data.user.id;

    // 2. Simulate AI consumption of 12000 tokens (reducing remaining to 88.0k)
    await trackTokensUsed(userId, 12000);

    // 3. Log in again with the same user to simulate new session
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ identifier: testUser.email, password: testUser.password })
      .expect(200);

    const newToken = loginRes.body.data.token;

    // 4. Fetch the groq status with new session token
    const statusRes = await request(app)
      .get('/api/user/groq-status')
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200);

    // 5. Assert absolute database persistence
    expect(statusRes.body.data.tokensRemaining).toBe(88000); // 100000 - 12000
    expect(statusRes.body.data.dailyRemaining).toBe(88000);
  });

  it('should reset tokens back to 100.0k (100000) at midnight UTC (new day)', async () => {
    // 1. Register and get token
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const token = regRes.body.data.token;
    const userId = regRes.body.data.user.id;

    // 2. Consume 15000 tokens today
    await trackTokensUsed(userId, 15000);

    // 3. Artificially set the lastTokenResetDate in database to yesterday (UTC day rollover)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    await User.findByIdAndUpdate(userId, { lastTokenResetDate: yesterday });

    // 4. Fetch the groq status (which triggers rollover verification on the backend)
    const statusRes = await request(app)
      .get('/api/user/groq-status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // 5. The daily limit must reset back to full capacity perfectly
    expect(statusRes.body.data.tokensRemaining).toBe(100000);
    expect(statusRes.body.data.dailyRemaining).toBe(100000);

    // 6. DB check should show dailyTokensUsed is reset to 0
    const rolledOverUser = await User.findById(userId);
    expect(rolledOverUser.dailyTokensUsed).toBe(0);
    expect(new Date(rolledOverUser.lastTokenResetDate).getUTCDate()).toBe(new Date().getUTCDate());
  });
});
