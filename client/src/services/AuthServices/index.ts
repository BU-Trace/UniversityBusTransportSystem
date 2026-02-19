'use server';

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { cookies } from 'next/headers';
import { FieldValues } from 'react-hook-form';
import { ClientITInfo, DriverClientInfo, UserRole } from '@/type/User';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

// DECOMMISSIONED: registerUser

export const loginUser = async (userData: FieldValues) => {
  try {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const result = await res.json();

    if (result.success) {
      const cookieStore = await cookies();
      cookieStore.set('accessToken', result.data.accessToken);
      cookieStore.set('refreshToken', result.data.refreshToken);
    }

    return result;
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ) {
    return Error(error);
  }
};
export interface IUserJWT extends JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientITInfo: ClientITInfo;
  lastLogin: string;
  isActive: boolean;
  profileImage?: string | null;
  needPasswordChange?: boolean;
  driverInfo?: DriverClientInfo;
  createdAt: string;
  updatedAt: string;
}

export const getCurrentUser = async (): Promise<IUserJWT | null> => {
  const accessToken = (await cookies()).get('accessToken')?.value;
  if (!accessToken) return null;
  return jwtDecode(accessToken);
};

export const logOutUser = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    return true;
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ) {
    return Error(error);
  }
};

export const getNewToken = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value || '';

    const res = await fetch(`${BASE_API}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: refreshToken,
      },
    });
    return res.json();
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ) {
    return Error(error);
  }
};

export const reCaptchaTokenVerification = async (token: string) => {
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.NEXT_PUBLIC_RECAPTCHA_SERVER_KEY!,
        response: token,
      }),
    });
    return res.json();
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any
  ) {
    return Error(err);
  }
};
