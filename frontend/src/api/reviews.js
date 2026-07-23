import { apiFetch } from './client';

export const reviewsApi = {
  // Returns { reviews: [...], averageRating, count }
  getForProduct: (productId) => apiFetch(`/reviews/product/${productId}`),

  create: (productId, { rating, comment }) =>
    apiFetch(`/reviews/product/${productId}`, { method: 'POST', body: { rating, comment } }),

  update: (reviewId, { rating, comment }) =>
    apiFetch(`/reviews/${reviewId}`, { method: 'PUT', body: { rating, comment } }),

  remove: (reviewId) => apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' }),
};
