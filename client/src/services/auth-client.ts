import { ClientITInfo } from '@/type/User';

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_API ||
  'http://localhost:5001/api/v1';

// remove trailing slashes
const API_BASE = RAW_BASE.replace(/\/+$/, '');

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
};

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'driver' | 'admin' | 'staff';
  clientInfo?: {
    bio?: string;
    department?: string;
    rollNumber?: string;
    licenseNumber?: string;
    designation?: string;
  };
  clientITInfo: ClientITInfo;
};

const safeJson = async (response: Response) => {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = (await safeJson(response)) as unknown;
  const parsed = data as Partial<ApiResponse<T>> & { message?: string; success?: boolean };

  if (!response.ok || parsed.success === false) {
    throw new Error(parsed.message || `Request failed (${response.status})`);
  }

  return {
    success: parsed.success ?? true,
    message: parsed.message ?? 'OK',
    data: parsed.data as T,
  };
};

async function apiFetch<T>(path: string, init: RequestInit) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      cache: 'no-store',
      credentials: 'include',
    });

    return await parseResponse<T>(response);
  } catch (err: unknown) {
    // This is the important part: real network errors land here
    console.error('FETCH FAILED:', { url, err });
    if (err instanceof Error) {
      throw new Error(err.message || 'fetch failed');
    }
    throw new Error('fetch failed');
  }
}

export const registerUser = (payload: RegisterUserPayload) => {
  return apiFetch<null>('/user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const verifyEmail = (payload: { email: string; otpToken: string }) => {
  return apiFetch<{ message: string | null }>('/user/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const requestPasswordReset = async (email: string) => {
  // Keeping your existing backend behavior
  const url = `${API_BASE}/auth/forget-password`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = (await safeJson(response)) as { message?: string };
    throw new Error(errorBody?.message || 'Unable to process request');
  }

  const data = (await safeJson(response)) as { success?: boolean; message?: string };
  return {
    success: data?.success !== false,
    message: data?.message || 'If an account exists, a reset link was sent.',
    data: null,
  } as ApiResponse<null>;
};

export const resetPassword = (token: string, newPassword: string) => {
  return apiFetch<null>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};
