const request = require('supertest');
const app = require('../app');
const prisma = require('../config/prisma');
const { resetDb, registerAgent, getFirstProductId } = require('./helpers/testHelpers');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/orders', () => {
  test('rejects checkout with an empty cart (400)', async () => {
    const { agent } = await registerAgent();
    const res = await agent.post('/api/orders');
    expect(res.status).toBe(400);
  });

  test('creates an order from the cart and clears the cart afterward', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 2 });

    const res = await agent.post('/api/orders');

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.items).toHaveLength(1);
    expect(res.body.order.items[0].quantity).toBe(2);

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body).toHaveLength(0);
  });

  test('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/orders');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/my-orders', () => {
  test("only returns the caller's own orders", async () => {
    const { agent: agentA } = await registerAgent();
    const { agent: agentB } = await registerAgent();
    const productId = await getFirstProductId();

    await agentA.post('/api/cart/add').send({ productId, quantity: 1 });
    await agentA.post('/api/orders');

    const resA = await agentA.get('/api/orders/my-orders');
    const resB = await agentB.get('/api/orders/my-orders');

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });
});

describe('GET /api/orders/:id', () => {
  test('the owner can view their own order', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await agent.post('/api/orders');

    const res = await agent.get(`/api/orders/${created.body.order.id}`);
    expect(res.status).toBe(200);
  });

  test('a different customer is blocked with 403', async () => {
    const { agent: owner } = await registerAgent();
    const { agent: intruder } = await registerAgent();
    const productId = await getFirstProductId();
    await owner.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await owner.post('/api/orders');

    const res = await intruder.get(`/api/orders/${created.body.order.id}`);
    expect(res.status).toBe(403);
  });

  test('an admin can view any order', async () => {
    const { agent: customer } = await registerAgent({ role: 'customer' });
    const { agent: admin } = await registerAgent({ role: 'admin' });
    const productId = await getFirstProductId();
    await customer.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await customer.post('/api/orders');

    const res = await admin.get(`/api/orders/${created.body.order.id}`);
    expect(res.status).toBe(200);
  });

  test('404s for a nonexistent order', async () => {
    const { agent } = await registerAgent();
    const res = await agent.get('/api/orders/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/orders (admin: list all)', () => {
  test('rejects a customer with 403', async () => {
    const { agent } = await registerAgent({ role: 'customer' });
    const res = await agent.get('/api/orders');
    expect(res.status).toBe(403);
  });

  test('returns every order for an admin', async () => {
    const { agent: customer } = await registerAgent({ role: 'customer' });
    const { agent: admin } = await registerAgent({ role: 'admin' });
    const productId = await getFirstProductId();
    await customer.post('/api/cart/add').send({ productId, quantity: 1 });
    await customer.post('/api/orders');

    const res = await admin.get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/orders/:id/status (admin only)', () => {
  test('updates the status as admin', async () => {
    const { agent: customer } = await registerAgent({ role: 'customer' });
    const { agent: admin } = await registerAgent({ role: 'admin' });
    const productId = await getFirstProductId();
    await customer.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await customer.post('/api/orders');

    const res = await admin.put(`/api/orders/${created.body.order.id}/status`).send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('shipped');
  });

  test('rejects an invalid status with 400', async () => {
    const { agent: customer } = await registerAgent({ role: 'customer' });
    const { agent: admin } = await registerAgent({ role: 'admin' });
    const productId = await getFirstProductId();
    await customer.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await customer.post('/api/orders');

    const res = await admin.put(`/api/orders/${created.body.order.id}/status`).send({ status: 'bogus' });
    expect(res.status).toBe(400);
  });

  test('rejects a non-admin with 403', async () => {
    const { agent: customer } = await registerAgent({ role: 'customer' });
    const productId = await getFirstProductId();
    await customer.post('/api/cart/add').send({ productId, quantity: 1 });
    const created = await customer.post('/api/orders');

    const res = await customer.put(`/api/orders/${created.body.order.id}/status`).send({ status: 'shipped' });
    expect(res.status).toBe(403);
  });
});