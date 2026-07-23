const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${ORIGIN}${imageUrl}`;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed with status ${res.status}`, res.status);
  }

  return data;
}
