const request = require('supertest');
const app = require('../../app');
const prisma = require('../../config/prisma');

async function resetDb() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE users, products RESTART IDENTITY CASCADE;');

  await prisma.product.createMany({
    data: [
      { title: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 19.99, category: 'electronics', image_url: '', stock: 50 },
      { title: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 79.99, category: 'electronics', image_url: '', stock: 20 },
    ],
  });
}

let counter = 0;
function uniqueEmail(prefix) {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}@example.com`;
}

async function registerAgent({ role = 'customer', name = 'Test User' } = {}) {
  const agent = request.agent(app);
  const email = uniqueEmail(role);
  const res = await agent.post('/api/auth/register').send({ name, email, password: 'password123', role });
  return { agent, res, email };
}

async function getFirstProductId() {
  const product = await prisma.product.findFirst({ orderBy: { created_at: 'asc' } });
  return product.id;
}

module.exports = { resetDb, registerAgent, getFirstProductId };