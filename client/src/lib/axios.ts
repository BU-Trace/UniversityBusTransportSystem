import axios from 'axios';
// ...existing code...
// ...existing code...
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// Get clean error message
export const getErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || 'An unexpected error occurred';
};

// Authenticated instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor: Attach token dynamically from session
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Note: getSession is async, but interceptors must be sync.
    // So, token must be set outside or use a sync storage (e.g. localStorage).
    // If you need to use getSession, consider using an interceptor with Promise support or set token before requests.
    // For now, fallback to localStorage or cookie if available.
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Only toast on the client side
    if (typeof window !== 'undefined') {
      const message = getErrorMessage(error);

      // Auto-refresh logic (401)
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        // Optionally toast 'Session expired, refreshing...' or similar
        toast.error(message);
      } else {
        toast.error(message);
      }
    }
    return Promise.reject(error);
  }
);

// Public instance
export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Response interceptor for publicApi (just error handling)
publicApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (typeof window !== 'undefined') {
      toast.error(getErrorMessage(error));
    }
    return Promise.reject(error);
  }
);

export default api;
