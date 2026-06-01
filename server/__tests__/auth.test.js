process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.NODE_ENV = 'test';
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should reject registration without name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
  };

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: testUser.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'noone@example.com', password: 'Password123!' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should reject login without identifier', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password123!' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/resumes (auth required)', () => {
  it('should return 401 without token', async () => {
    const res = await request(app)
      .get('/api/resumes')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/resumes')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should return resumes with valid token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'Password123!' });

    const token = registerRes.body.data.token;

    const res = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
