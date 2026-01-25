import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { JWT } from 'next-auth/jwt';

type DecodedUser = JwtPayload & {
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/v1';

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    if (!token.refreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token.refreshToken}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.accessToken) {
      throw new Error(data?.message || 'Unable to refresh session');
    }

    const decoded = jwtDecode<DecodedUser>(data.data.accessToken);

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
      accessTokenExpires: (decoded.exp ?? 0) * 1000,
      user: {
        ...(token.user || {}),
        id: decoded.userId ?? token.sub ?? token.user?.id,
        name: decoded.name ?? token.user?.name,
        email: decoded.email ?? token.user?.email,
        role: decoded.role ?? token.user?.role ?? null,
      },
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
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'user-agent': req?.headers?.get?.('user-agent') ?? '',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok || !data?.data?.accessToken) {
          throw new Error(data?.message || 'Invalid credentials');
        }

        const decoded = jwtDecode<DecodedUser>(data.data.accessToken);

        return {
          id: decoded.userId ?? decoded.sub ?? credentials.email,
          email: decoded.email ?? credentials.email,
          name: decoded.name ?? credentials.email,
          role: decoded.role,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          accessTokenExpires: (decoded.exp ?? 0) * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: (user as unknown as { accessToken?: string }).accessToken,
          refreshToken: (user as unknown as { refreshToken?: string }).refreshToken,
          accessTokenExpires: (user as unknown as { accessTokenExpires?: number })
            .accessTokenExpires,
          user: {
            id: (user as unknown as { id?: string }).id ?? token.sub,
            name: user.name,
            email: user.email,
            role: (user as unknown as { role?: string }).role ?? null,
          },
          error: undefined,
        };
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60 * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      session.user = {
        ...session.user,
        ...token.user,
        role: token.user?.role ?? undefined,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
