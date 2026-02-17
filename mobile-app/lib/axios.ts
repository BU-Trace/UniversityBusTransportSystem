import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:5000/api/v1';

// Get clean error message
export const getErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || 'An unexpected error occurred';
};

// Main API instance
export const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor: Attach token from SecureStore if available
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Fail silently if SecureStore fails
    console.warn('Axios interceptor: Token fetch failed', err);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401) {
      // Handle auto-logout or token refresh logic here
    }
    return Promise.reject(error);
  }
);

// Alias publicApi for backward compatibility (optional but recommended for now)
export const publicApi = api;

export default api;
