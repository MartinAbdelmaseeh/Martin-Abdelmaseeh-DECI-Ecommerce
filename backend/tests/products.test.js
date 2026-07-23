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

describe('GET /api/products', () => {
  test('returns products with pagination metadata, no auth required', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.pagination).toEqual(
      expect.objectContaining({ total: expect.any(Number), limit: expect.any(Number), offset: expect.any(Number) })
    );
  });

  test('search filters by title/description', async () => {
    const res = await request(app).get('/api/products?search=Mouse');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products.every((p) => p.title.toLowerCase().includes('mouse'))).toBe(true);
  });

  test('sortBy price ASC returns ascending prices', async () => {
    const res = await request(app).get('/api/products?sortBy=price&order=ASC');
    expect(res.status).toBe(200);
    const prices = res.body.products.map((p) => Number(p.price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('an unrecognized sortBy falls back to created_at instead of erroring', async () => {
    const res = await request(app).get('/api/products?sortBy=DROP TABLE products;--');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/products/:id', () => {
  test('returns a single product', async () => {
    const id = await getFirstProductId();
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('404s for a well-formed but unknown UUID', async () => {
    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  test('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/products').send({ title: 'X', price: 1 });
    expect(res.status).toBe(401);
  });

  test('rejects a logged-in customer with 403', async () => {
    const { agent } = await registerAgent({ role: 'customer' });
    const res = await agent.post('/api/products').send({ title: 'X', price: 1 });
    expect(res.status).toBe(403);
  });

  test('requires title and price', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const res = await agent.post('/api/products').send({ description: 'no title or price' });
    expect(res.status).toBe(400);
  });

  test('succeeds for an admin', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const res = await agent.post('/api/products').send({
      title: 'Test Widget', description: 'desc', price: 9.99, category: 'misc', stock: 5
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Widget');
    expect(res.body.id).toBeDefined();
  });
});

describe('PUT /api/products/:id', () => {
  test('updates a product as admin, leaving unspecified fields unchanged', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const created = await agent.post('/api/products').send({ title: 'Old Title', price: 5, stock: 3 });

    const res = await agent.put(`/api/products/${created.body.id}`).send({ title: 'New Title' });

    expect(res.status).toBe(200);
    expect(res.body.product.title).toBe('New Title');
    expect(Number(res.body.product.stock)).toBe(3); // untouched field preserved
  });

  test('404s when updating a nonexistent product', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const res = await agent
      .put('/api/products/00000000-0000-0000-0000-000000000000')
      .send({ title: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('rejects a customer with 403', async () => {
    const { agent: admin } = await registerAgent({ role: 'admin' });
    const created = await admin.post('/api/products').send({ title: 'X', price: 1 });

    const { agent: customer } = await registerAgent({ role: 'customer' });
    const res = await customer.put(`/api/products/${created.body.id}`).send({ title: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/products/:id', () => {
  test('deletes a product as admin', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const created = await agent.post('/api/products').send({ title: 'ToDelete', price: 3 });

    const res = await agent.delete(`/api/products/${created.body.id}`);
    expect(res.status).toBe(200);

    const getRes = await request(app).get(`/api/products/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  test('404s when deleting a nonexistent product', async () => {
    const { agent } = await registerAgent({ role: 'admin' });
    const res = await agent.delete('/api/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});