//updated on 2024-06-20

import type { NextAuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { JWT } from 'next-auth/jwt';

/**
 * Define supported user roles
 */
type UserRole = 'driver' | 'admin' | 'superadmin';

interface DecodedUser extends JwtPayload {
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
}

interface TokenUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | string | null;
  image?: string | null;
  photoUrl?: string | null;
  profileImage?: string | null;
  isApproved?: boolean;
  isActive?: boolean;
}

interface LoginResponse {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

interface AuthUser extends User {
  id: string;
  role?: UserRole | string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
}

/**
 * Normalizes role strings to UserRole type
 */
function toUserRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  if (normalized === 'driver' || normalized === 'admin' || normalized === 'superadmin') {
    return normalized as UserRole;
  }
  return null;
}

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1';

/**
 * Attempts to refresh the access token using the backend refresh endpoint
 */
const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as LoginResponse;

    if (!response.ok || !data?.data?.accessToken) {
      throw new Error(data?.message || 'Unable to refresh session');
    }

    const decoded = jwtDecode<DecodedUser>(data.data.accessToken);
    const oldUser = (token.user ?? {}) as TokenUser;

    return {
      ...token,
      accessToken: data.data.accessToken,
      accessTokenExpires: (decoded.exp ?? 0) * 1000,
      user: {
        ...oldUser,
        id: decoded.userId ?? token.sub ?? oldUser.id,
        name: decoded.name ?? oldUser.name,
        email: decoded.email ?? oldUser.email,
        role: toUserRole(decoded.role) ?? oldUser.role ?? null,
      },
      error: undefined,
    };
  } catch (error) {
    console.log(error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 365 * 24 * 60 * 60, // 1 Year
    updateAge: 24 * 60 * 60,    // 24 Hours
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const userAgent = typeof req?.headers?.get === 'function' ? (req.headers.get('user-agent') ?? '') : '';

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-agent': userAgent,
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          credentials: 'include',
          cache: 'no-store',
        });

        const data = (await response.json().catch(() => ({}))) as LoginResponse;

        if (!response.ok || !data?.data?.accessToken) {
          throw new Error(data?.message || 'Invalid credentials');
        }

        const decoded = jwtDecode<DecodedUser>(data.data.accessToken);

        return {
          id: decoded.userId ?? decoded.sub ?? credentials.email,
          email: decoded.email ?? credentials.email,
          name: decoded.name ?? credentials.email,
          role: toUserRole(decoded.role) || decoded.role?.toLowerCase() || undefined,
          accessToken: data.data.accessToken,
          accessTokenExpires: (decoded.exp ?? 0) * 1000,
        } as AuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      /**
       * Handle client-side session updates
       */
      if (trigger === 'update' && session) {
        const tokenUser = (token.user ?? {}) as TokenUser;
        const newName = session.user?.name ?? tokenUser.name;
        const newImage = session.user?.image ?? session.user?.photoUrl ?? session.user?.profileImage ?? tokenUser.image;

        return {
          ...token,
          name: newName,
          image: newImage,
          user: {
            ...tokenUser,
            name: newName,
            image: newImage,
            photoUrl: newImage,
            profileImage: newImage,
          },
        };
      }

      /**
       * Initial sign-in: Save data to token
       */
      if (user) {
        const u = user as AuthUser;
        const image = u.image ?? u.photoUrl ?? u.profileImage ?? null;

        return {
          ...token,
          name: u.name,
          email: u.email,
          image: image,
          accessToken: u.accessToken,
          accessTokenExpires: u.accessTokenExpires,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role ?? null,
            image: image,
            photoUrl: image,
            profileImage: image,
          } satisfies TokenUser,
          error: undefined,
        };
      }

      /**
       * Return token if access token is still valid (with 1-minute buffer)
       */
      if (token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires) - 60000) {
        return token;
      }

      /**
       * Access token expired: Refresh it
       */
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      // Pass token data to the session object
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      const tokenUser = token.user as TokenUser;

      if (tokenUser || token) {
        const image = (tokenUser?.image ?? token?.image ?? session.user?.image) as string;

        session.user = {
          ...session.user,
          id: (tokenUser?.id ?? token.userId ?? token.sub ?? session.user?.id) as string,
          name: (tokenUser?.name ?? token?.name ?? session.user?.name) as string,
          email: (tokenUser?.email ?? token?.email ?? session.user?.email) as string,
          role: (tokenUser?.role ?? token.role ?? session.user?.role) as UserRole,
          image,
          photoUrl: image,
          profileImage: image,
        };
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};