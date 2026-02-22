//22-2-26

import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Attach token
 */
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Auto refresh on 401
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // 🔥 CHANGED → force session refresh
      await fetch('/api/auth/session?update');

      const session = await getSession();
      const newToken = session?.accessToken;

      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config); // 🔥 retry request
      }

      toast.error('Session expired');
      await signOut({ callbackUrl: '/login' });
    }

    return Promise.reject(error);
  }
);

export default api;