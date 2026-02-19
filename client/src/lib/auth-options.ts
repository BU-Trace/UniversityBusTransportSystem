import type { NextAuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { JWT } from 'next-auth/jwt';

type UserRole = 'driver' | 'admin' | 'superadmin';

type DecodedUser = JwtPayload & {
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
};

type TokenUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | string | null;
  image?: string | null;
  photoUrl?: string | null;
  profileImage?: string | null;
  isApproved?: boolean;
  isActive?: boolean;
};

type LoginResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
};

interface AuthUser extends User {
  id: string;
  role?: UserRole | string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
}

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

    const data = (await response.json().catch(() => ({}))) as LoginResponse;

    if (!response.ok || !data?.data?.accessToken) {
      throw new Error(data?.message || 'Unable to refresh session');
    }

    const decoded = jwtDecode<DecodedUser>(data.data.accessToken);
    const oldUser = (token.user ?? {}) as TokenUser;

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken ?? token.refreshToken,
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
    maxAge: 365 * 24 * 60 * 60, // 365 days
    updateAge: 24 * 60 * 60, // Only update once every 24 hours
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
        const userAgent =
          typeof req?.headers?.get === 'function' ? (req.headers.get('user-agent') ?? '') : '';

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
          cache: 'no-store',
        });

        const data = (await response.json().catch(() => ({}))) as LoginResponse;

        if (!response.ok || !data?.data?.accessToken) {
          throw new Error(data?.message || 'Invalid credentials');
        }

        const decoded = jwtDecode<DecodedUser>(data.data.accessToken);
        const user: AuthUser = {
          id: decoded.userId ?? decoded.sub ?? credentials.email,
          email: decoded.email ?? credentials.email,
          name: decoded.name ?? credentials.email,
          role: toUserRole(decoded.role) || decoded.role?.toLowerCase() || undefined,

          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          accessTokenExpires: (decoded.exp ?? 0) * 1000,
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        const tokenUser = (token.user ?? {}) as TokenUser;
        const newName = session.user?.name ?? tokenUser.name;
        // Collect image from any available variant
        const newImage =
          session.user?.image ??
          session.user?.photoUrl ??
          session.user?.profileImage ??
          tokenUser.image;

        return {
          ...token,
          // Sync root fields
          name: newName,
          image: newImage,
          // Sync nested user object
          user: {
            ...tokenUser,
            name: newName,
            image: newImage,
            photoUrl: newImage,
            profileImage: newImage,
          },
        };
      }

      if (user) {
        const u = user as AuthUser;
        const image = u.profileImage ?? u.image ?? u.photoUrl ?? null;

        return {
          ...token,
          name: u.name,
          email: u.email,
          image: image,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
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

      if (token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires) - 60 * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      const tokenUser = token.user;

      if (tokenUser || token) {
        const role = (tokenUser?.role ??
          token.role ??
          session.user?.role) as UserRole;
        const name = (tokenUser?.name ?? token?.name ?? session.user?.name) as string;
        const email = (tokenUser?.email ?? token?.email ?? session.user?.email) as string;
        const image = (tokenUser?.image ?? token?.image ?? session.user?.image) as string;

        session.user = {
          ...session.user,
          id: (tokenUser?.id ?? token.userId ?? token.sub ?? session.user?.id) as string,
          name,
          email,
          image,
          role,
        };

        // Add variants to user object for components that expect them
        if (session.user) {
          session.user.photoUrl = image;
          session.user.profileImage = image;
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
