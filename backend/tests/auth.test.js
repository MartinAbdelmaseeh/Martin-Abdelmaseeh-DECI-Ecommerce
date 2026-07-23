const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { resetDb, registerAgent } = require('./helpers/testHelpers');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  test('creates a new customer, hides the password, and sets a session cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Alice', email: 'alice@example.com', role: 'customer' });
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects a duplicate email with 400', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'A', email: 'dup@example.com', password: 'password123'
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'B', email: 'dup@example.com', password: 'password123'
    });

    expect(res.status).toBe(400);
  });

  test('requires name, email, and password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'bob@example.com', password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com', password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('rejects a wrong password with 400', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Carl', email: 'carl@example.com', password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'carl@example.com', password: 'wrongpassword'
    });

    expect(res.status).toBe(400);
  });

  test('rejects a nonexistent email with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com', password: 'password123'
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns the logged-in user for a valid session', async () => {
    const { agent, email } = await registerAgent({ name: 'Dana' });
    const res = await agent.get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body.password).toBeUndefined();
  });
});

describe('POST /api/auth/logout', () => {
  test('clears the session so /me becomes unauthorized again', async () => {
    const { agent } = await registerAgent({ name: 'Eve' });

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});

describe('PUT /api/auth/profile', () => {
  test('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).put('/api/auth/profile').send({ name: 'New Name' });
    expect(res.status).toBe(401);
  });

  test('updates the name and it takes effect immediately', async () => {
    const { agent } = await registerAgent({ name: 'Frank' });

    const res = await agent.put('/api/auth/profile').send({ name: 'Franklin' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Franklin');

    const meRes = await agent.get('/api/auth/me');
    expect(meRes.body.name).toBe('Franklin');
  });

  test('updates the email', async () => {
    const { agent } = await registerAgent({ name: 'Grace' });

    const res = await agent.put('/api/auth/profile').send({ email: 'grace-updated@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('grace-updated@example.com');
  });

  test('rejects an email already used by a different account', async () => {
    const { email: takenEmail } = await registerAgent({ name: 'Holder' });
    const { agent } = await registerAgent({ name: 'Requester' });

    const res = await agent.put('/api/auth/profile').send({ email: takenEmail });
    expect(res.status).toBe(400);
  });

  test('updates the password, and the new password actually works on next login', async () => {
    const { agent, email } = await registerAgent({ name: 'Ivan' });

    const updateRes = await agent.put('/api/auth/profile').send({ password: 'newpassword456' });
    expect(updateRes.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'newpassword456' });
    expect(loginRes.status).toBe(200);
  });

  test('rejects a password shorter than 6 characters', async () => {
    const { agent } = await registerAgent({ name: 'Jill' });
    const res = await agent.put('/api/auth/profile').send({ password: '123' });
    expect(res.status).toBe(400);
  });

  test('rejects an empty request body with 400', async () => {
    const { agent } = await registerAgent({ name: 'Kim' });
    const res = await agent.put('/api/auth/profile').send({});
    expect(res.status).toBe(400);
  });

  test('never changes role even if one is sent in the request', async () => {
    const { agent } = await registerAgent({ name: 'Leo', role: 'customer' });

    const res = await agent.put('/api/auth/profile').send({ name: 'Leo Updated', role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('customer');
  });
});