import { apiFetch } from './client';

export const cartApi = {
  get: () => apiFetch('/cart'),

  add: (productId, quantity = 1) =>
    apiFetch('/cart/add', { method: 'POST', body: { productId, quantity } }),

  updateQuantity: (productId, quantity) =>
    apiFetch('/cart/update', { method: 'PUT', body: { productId, quantity } }),

  remove: (productId) => apiFetch(`/cart/${productId}`, { method: 'DELETE' }),

  clear: () => apiFetch('/cart', { method: 'DELETE' }),
};
