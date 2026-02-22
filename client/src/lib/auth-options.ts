import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import type { JWT } from 'next-auth/jwt';
import { cookies } from 'next/headers'; // 🔥 CHANGED

type UserRole = 'driver' | 'admin' | 'superadmin';

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1';

/**
 * 🔄 Refresh Access Token
 */
const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    // 🔥 CHANGED → forward cookie manually
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: cookieHeader, // 🔥 IMPORTANT
      },
    });

    const data = await res.json();

    if (!res.ok || !data?.data?.accessToken) {
      throw new Error('Failed to refresh token');
    }

    const decoded = jwtDecode<DecodedToken>(data.data.accessToken);

    return {
      ...token,
      accessToken: data.data.accessToken,
      accessTokenExpires: decoded.exp * 1000,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email & password required');
        }

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (!res.ok || !data?.data?.accessToken) {
          throw new Error(data?.message || 'Login failed');
        }

        const decoded = jwtDecode<DecodedToken>(
          data.data.accessToken
        );

        return {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          accessToken: data.data.accessToken,
          accessTokenExpires: decoded.exp * 1000,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpires: user.accessTokenExpires,
          role: user.role,
          id: user.id,
        };
      }

      if (
        token.accessTokenExpires &&
        Date.now() < Number(token.accessTokenExpires) - 60000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as UserRole,
      };

      session.accessToken = token.accessToken as string;
      session.error = token.error as string;

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};