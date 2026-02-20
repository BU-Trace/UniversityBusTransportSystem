import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { getSession, signOut } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Custom interface to track retry attempts for 401 errors
 */
interface CustomInternalConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Utility to extract readable error messages from Axios responses
 */
export const getErrorMessage = (error: any): string => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || 'An unexpected error occurred';
};

/**
 * API Instance for authenticated requests
 */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Request Interceptor: Dynamically attaches the Bearer token
 * from the NextAuth session or localStorage.
 */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    const token = (session as any)?.accessToken || localStorage.getItem('accessToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Response Interceptor: Handles automatic token retry on 401 Unauthorized
 * and triggers logout if the session cannot be restored.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomInternalConfig;

    // Detect 401 errors and prevent infinite retry loops
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        const newToken = (session as any)?.accessToken;

        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with the fresh token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If refresh fails, force sign out
      if (typeof window !== 'undefined') {
        toast.error('Session expired. Please login again.');
        await signOut({ callbackUrl: '/login' });
      }
    }

    // Global error notification (skipped for retriable 401s)
    if (typeof window !== 'undefined' && error?.response?.status !== 401) {
      toast.error(getErrorMessage(error));
    }

    return Promise.reject(error);
  }
);

/**
 * Public API Instance for open endpoints (Login, Register, etc.)
 */
export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      toast.error(getErrorMessage(error));
    }
    return Promise.reject(error);
  }
);

export default api;