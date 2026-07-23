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

describe('GET /api/cart', () => {
  test('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('returns an empty array for a fresh account', async () => {
    const { agent } = await registerAgent();
    const res = await agent.get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/cart/add', () => {
  test('adds an item to the cart', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();

    const res = await agent.post('/api/cart/add').send({ productId, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.item.quantity).toBe(2);
  });

  test('requires productId', async () => {
    const { agent } = await registerAgent();
    const res = await agent.post('/api/cart/add').send({ quantity: 1 });
    expect(res.status).toBe(400);
  });

  test('adding the same product twice increments quantity rather than duplicating', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();

    await agent.post('/api/cart/add').send({ productId, quantity: 1 });
    await agent.post('/api/cart/add').send({ productId, quantity: 2 });

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body).toHaveLength(1);
    expect(cartRes.body[0].quantity).toBe(3);
  });
});

describe('PUT /api/cart/update', () => {
  test('changes the quantity of an existing item', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 1 });

    const res = await agent.put('/api/cart/update').send({ productId, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.item.quantity).toBe(5);
  });

  test('quantity 0 removes the item instead of erroring', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 1 });

    const res = await agent.put('/api/cart/update').send({ productId, quantity: 0 });
    expect(res.status).toBe(200);

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body).toHaveLength(0);
  });

  test('404s when updating a product that was never added', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();

    const res = await agent.put('/api/cart/update').send({ productId, quantity: 5 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/cart/:productId', () => {
  test('removes a specific item', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 1 });

    const res = await agent.delete(`/api/cart/${productId}`);
    expect(res.status).toBe(200);

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body).toHaveLength(0);
  });

  test('404s when the item is not in the cart', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();

    const res = await agent.delete(`/api/cart/${productId}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/cart', () => {
  test('clears the whole cart', async () => {
    const { agent } = await registerAgent();
    const productId = await getFirstProductId();
    await agent.post('/api/cart/add').send({ productId, quantity: 3 });

    const res = await agent.delete('/api/cart');
    expect(res.status).toBe(200);

    const cartRes = await agent.get('/api/cart');
    expect(cartRes.body).toHaveLength(0);
  });
});