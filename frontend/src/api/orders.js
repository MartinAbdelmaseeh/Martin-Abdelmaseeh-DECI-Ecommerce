import { apiFetch } from './client';

export const ordersApi = {
  create: () => apiFetch('/orders', { method: 'POST' }),

  getMyOrders: () => apiFetch('/orders/my-orders'),

  getById: (id) => apiFetch(`/orders/${id}`),

  // Admin-only
  getAll: () => apiFetch('/orders'),
  updateStatus: (id, status) =>
    apiFetch(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
};
