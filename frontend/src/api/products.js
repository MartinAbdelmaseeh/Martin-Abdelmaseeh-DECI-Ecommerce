import { apiFetch } from './client';

// Builds a FormData payload for create/update so an optional image file can
// ride alongside the other fields — matches upload.single('image') on the
// backend, which expects the file under the field name "image".
function toProductFormData({ title, description, price, category, stock, imageFile }) {
  const form = new FormData();
  if (title !== undefined) form.append('title', title);
  if (description !== undefined) form.append('description', description);
  if (price !== undefined) form.append('price', price);
  if (category !== undefined) form.append('category', category);
  if (stock !== undefined) form.append('stock', stock);
  if (imageFile) form.append('image', imageFile);
  return form;
}

export const productsApi = {
  // filters: { category, search, sortBy, order, limit, offset }
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    });
    const query = params.toString();
    return apiFetch(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiFetch(`/products/${id}`),

  // Returns { categories: string[] } — powers the catalog's category filter.
  getCategories: () => apiFetch('/products/categories'),

  create: (productData) =>
    apiFetch('/products', { method: 'POST', body: toProductFormData(productData) }),

  update: (id, productData) =>
    apiFetch(`/products/${id}`, { method: 'PUT', body: toProductFormData(productData) }),

  remove: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};
