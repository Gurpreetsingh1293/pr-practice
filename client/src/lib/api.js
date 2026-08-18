import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1`,
  withCredentials: true, // Send httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Response Interceptor ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Auto-redirect to login on 401 (client-side only)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
