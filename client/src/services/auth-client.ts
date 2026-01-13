import { ClientITInfo } from '@/type/User';

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1';

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
};

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'driver' | 'admin';
  clientInfo?: {
    bio?: string;
    department?: string;
    rollNumber?: string;
    licenseNumber?: string;
  };
  clientITInfo: ClientITInfo;
};

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Something went wrong');
  }
  return data as ApiResponse<T>;
};

export const registerUser = async (payload: RegisterUserPayload) => {
  const response = await fetch(`${API_BASE}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    credentials: 'include',
  });

  return parseResponse<null>(response);
};

export const verifyEmail = async (payload: { email: string; otpToken: string }) => {
  const response = await fetch(`${API_BASE}/user/verfy-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
    credentials: 'include',
  });

  return parseResponse<{ message: string | null }>(response);
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${API_BASE}/auth/forget-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
    credentials: 'include',
  });

  // The backend currently returns success: false with a useful message, so treat any HTTP 2xx as success.
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || 'Unable to process request');
  }

  const data = await response.json().catch(() => ({}));
  return {
    success: data?.success !== false,
    message: data?.message || 'If an account exists, a reset link was sent.',
  } as ApiResponse<null>;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
    cache: 'no-store',
    credentials: 'include',
  });

  return parseResponse<null>(response);
};
