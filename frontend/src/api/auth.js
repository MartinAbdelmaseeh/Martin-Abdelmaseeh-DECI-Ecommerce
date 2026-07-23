import { apiFetch } from './client';

export const authApi = {
  register: ({ name, email, password }) =>
    apiFetch('/auth/register', { method: 'POST', body: { name, email, password } }),

  login: ({ email, password }) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  me: () => apiFetch('/auth/me'),

  updateProfile: (updates) => apiFetch('/auth/profile', { method: 'PUT', body: updates }),
};
