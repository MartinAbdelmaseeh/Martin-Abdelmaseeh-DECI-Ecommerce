export const products = [
  {
    id: 'prod-1',
    title: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 19.99,
    category: 'electronics',
    image_url: null,
    stock: 12,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    title: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    price: 79.99,
    category: 'electronics',
    image_url: null,
    stock: 3,
    created_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    title: 'Out of Stock Widget',
    description: 'Currently unavailable',
    price: 9.99,
    category: 'misc',
    image_url: null,
    stock: 0,
    created_at: '2025-01-03T00:00:00.000Z',
  },
];

export const categories = ['electronics', 'misc'];

export function makeUser(overrides = {}) {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    ...overrides,
  };
}