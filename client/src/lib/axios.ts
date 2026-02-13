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

import { getSession } from 'next-auth/react';
import type { InternalAxiosRequestConfig } from 'axios';

interface CustomSession {
  user?: { accessToken?: string };
  accessToken?: string;
}

// Request interceptor: Attach token dynamically from next-auth session
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const session = (await getSession()) as CustomSession | null;
    const token = session?.user?.accessToken || session?.accessToken || localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (typeof window !== 'undefined') {
      const message = getErrorMessage(error);

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
