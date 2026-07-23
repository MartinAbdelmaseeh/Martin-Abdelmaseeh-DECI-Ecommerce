import { http, HttpResponse } from 'msw';
import { products, categories } from './fixtures';

const BASE = 'http://localhost:5000/api';

let cartState = [];
let currentUser = null; 

export function resetMockState() {
  cartState = [];
  currentUser = null;
}

export function setMockUser(user) {
  currentUser = user;
}


export function seedCartItems(items) {
  cartState = items.map((item) => ({ ...item }));
}

// --- Handlers --------------------------------------------------------------

export const handlers = [
  http.get(`${BASE}/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sortBy');
    const order = url.searchParams.get('order');

    let list = [...products];
    if (search) {
      const needle = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.description || '').toLowerCase().includes(needle)
      );
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    if (sortBy === 'price') {
      list = [...list].sort((a, b) => (order === 'ASC' ? a.price - b.price : b.price - a.price));
    }

    return HttpResponse.json({
      products: list,
      pagination: { total: list.length, limit: 12, offset: 0, hasMore: false },
    });
  }),

  http.get(`${BASE}/products/categories`, () => HttpResponse.json({ categories })),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  // Auth
  http.get(`${BASE}/auth/me`, () => {
    if (!currentUser) {
      return HttpResponse.json({ message: 'Access denied. Please log in.' }, { status: 401 });
    }
    return HttpResponse.json(currentUser);
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@example.com' && body.password === 'password123') {
      currentUser = { id: 'user-1', name: 'Test User', email: body.email, role: 'customer' };
      return HttpResponse.json({ message: 'Logged in successfully', user: currentUser });
    }
    return HttpResponse.json({ message: 'Invalid credentials.' }, { status: 400 });
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    currentUser = { id: 'user-2', name: body.name, email: body.email, role: 'customer' };
    return HttpResponse.json({ message: 'Registered successfully', user: currentUser }, { status: 201 });
  }),

  http.post(`${BASE}/auth/logout`, () => {
    currentUser = null;
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Cart
  http.get(`${BASE}/cart`, () => HttpResponse.json(cartState)),

  http.post(`${BASE}/cart/add`, async ({ request }) => {
    const { productId, quantity = 1 } = await request.json();
    const product = products.find((p) => p.id === productId);
    const existing = cartState.find((i) => i.product_id === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cartState.push({
        item_id: `item-${productId}`,
        product_id: productId,
        title: product?.title || 'Unknown product',
        price: product?.price || 0,
        image_url: product?.image_url || null,
        quantity,
      });
    }

    return HttpResponse.json({
      message: 'Item added to cart',
      item: cartState.find((i) => i.product_id === productId),
    });
  }),

  http.put(`${BASE}/cart/update`, async ({ request }) => {
    const { productId, quantity } = await request.json();
    const item = cartState.find((i) => i.product_id === productId);
    if (!item) return HttpResponse.json({ message: 'Item not found in cart' }, { status: 404 });

    if (quantity <= 0) {
      cartState = cartState.filter((i) => i.product_id !== productId);
      return HttpResponse.json({ message: 'Item removed from cart', item });
    }

    item.quantity = quantity;
    return HttpResponse.json({ message: 'Cart item updated', item });
  }),

  http.delete(`${BASE}/cart/:productId`, ({ params }) => {
    const item = cartState.find((i) => i.product_id === params.productId);
    if (!item) return HttpResponse.json({ message: 'Item not found in cart' }, { status: 404 });
    cartState = cartState.filter((i) => i.product_id !== params.productId);
    return HttpResponse.json({ message: 'Item removed from cart', item });
  }),

  http.delete(`${BASE}/cart`, () => {
    cartState = [];
    return HttpResponse.json({ message: 'Cart cleared' });
  }),

  // Orders
  http.post(`${BASE}/orders`, () => {
    if (cartState.length === 0) {
      return HttpResponse.json({ message: 'Your cart is empty' }, { status: 400 });
    }
    const order = {
      id: 'order-1',
      status: 'pending',
      total_amount: cartState.reduce((sum, i) => sum + i.price * i.quantity, 0),
      created_at: new Date().toISOString(),
      items: cartState.map((i) => ({ id: i.item_id, title: i.title, price: i.price, quantity: i.quantity })),
    };
    cartState = [];
    return HttpResponse.json({ message: 'Order placed successfully', order }, { status: 201 });
  }),

  http.get(`${BASE}/orders/my-orders`, () => HttpResponse.json([])),

  // Reviews
  http.get(`${BASE}/reviews/product/:productId`, () =>
    HttpResponse.json({ reviews: [], averageRating: null, count: 0 })
  ),
];