import type { DefaultSession, DefaultUser } from 'next-auth';

export type UserRole = 'driver' | 'admin' | 'superadmin' | string;

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      _id?: string;
      userId: string;
      role?: UserRole;
      photoUrl?: string;
      profileImage?: string;
      isApproved?: boolean;
      isActive?: boolean;
      clientInfo?: {
        licenseNumber?: string;
      };
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: UserRole;
    photoUrl?: string;
    profileImage?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId?: string;
    _id?: string;
    isApproved?: boolean;
    isActive?: boolean;
    clientInfo?: {
      licenseNumber?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    userId?: string;
    role?: UserRole;
    isApproved?: boolean;
    isActive?: boolean;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole | null;
      photoUrl?: string | null;
      profileImage?: string | null;
      isApproved?: boolean;
      isActive?: boolean;
      clientInfo?: {
        licenseNumber?: string;
      } | null;
    };
    error?: string;
  }
}
