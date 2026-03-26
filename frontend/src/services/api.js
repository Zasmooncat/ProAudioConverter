import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const register = (email, password) =>
  api.post('/api/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () => api.get('/api/auth/me');

// ── Conversion ────────────────────────────────────────────────────────────────
export const convertAudio = (formData, onUploadProgress) =>
  api.post('/api/convert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const getDownloadUrl = (filename) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/download/${filename}`;

// ── Stripe ────────────────────────────────────────────────────────────────────
export const createCheckout = () => api.post('/api/stripe/create-checkout');
export const cancelSubscription = () => api.post('/api/stripe/cancel');

export default api;
