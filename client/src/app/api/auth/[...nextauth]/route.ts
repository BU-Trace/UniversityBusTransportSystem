//updated on 2024-06-20


import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User as NextAuthUser,
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth-options';

/**
 * Interface to support custom fields from backend/database
 */
interface ExtendedUser {
  id?: string;
  userId?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  isApproved?: boolean;
  isActive?: boolean;
  photoUrl?: string | null;
  profileImage?: string | null;
  _id?: string;
  accessToken?: string;
}

/**
 * enhancedAuthOptions: Wraps base authOptions to ensure custom properties 
 * like role, userId, and accessToken are persisted in JWT and Session.
 */
const enhancedAuthOptions: NextAuthOptions = {
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,

    async jwt({ token, user, account, profile, trigger, session }): Promise<JWT> {
      // Execute base JWT callback if it exists
      const baseJwtCb = authOptions.callbacks?.jwt;
      const base = baseJwtCb
        ? await baseJwtCb({ token, user, account, profile, trigger, session })
        : token;

      const nextToken: JWT = { ...base };

      /**
       * Handle Session Updates (client-side update() call)
       */
      if (trigger === 'update' && session) {
        const sUser = session.user as ExtendedUser | undefined;
        const newName = sUser?.name ?? nextToken.name;
        const newImage = (sUser?.image ?? sUser?.photoUrl ?? sUser?.profileImage ?? nextToken.image) as string;

        nextToken.name = newName;
        nextToken.image = newImage;

        if (nextToken.user) {
          const tUser = nextToken.user as ExtendedUser;
          tUser.name = newName;
          tUser.image = newImage;
          tUser.photoUrl = newImage;
          tUser.profileImage = newImage;
        }
      }

      /**
       * Handle Initial Sign-In
       * Maps user data from the provider/database to the JWT token
       */
      if (user) {
        const u = user as ExtendedUser & NextAuthUser;
        const image = (u.profileImage ?? u.image ?? u.photoUrl ?? nextToken.image) as string;

        nextToken.userId = u.userId || u._id || u.id || nextToken.userId;
        nextToken.role = u.role ?? nextToken.role;
        nextToken.isApproved = u.isApproved ?? nextToken.isApproved;
        nextToken.isActive = u.isActive ?? nextToken.isActive;
        nextToken.email = u.email ?? nextToken.email;
        nextToken.name = u.name ?? nextToken.name;
        nextToken.image = image;
        (nextToken as any).accessToken = u.accessToken ?? (nextToken as any).accessToken;

        if (nextToken.user) {
          const tUser = nextToken.user as ExtendedUser;
          tUser.image = image;
          tUser.photoUrl = image;
          tUser.profileImage = image;
        }
      }

      return nextToken;
    },

    async session({ session, token, user, trigger, newSession }): Promise<Session> {
      // Execute base session callback if it exists
      const baseSessionCb = authOptions.callbacks?.session;
      const base = baseSessionCb
        ? (await baseSessionCb({ session, token, user, trigger, newSession })) as Session
        : (session as Session);

      /**
       * Synchronize JWT token data with the Session object
       */
      if (base?.user) {
        const tUser = (token.user ?? {}) as ExtendedUser;
        const bUser = base.user as ExtendedUser;
        const image = (tUser.image ?? token.image ?? bUser.image) as string;

        base.user = {
          ...base.user,
          id: (tUser.id ?? token.userId ?? token.sub ?? bUser.id) as string,
          userId: (tUser.id ?? token.userId ?? token.sub ?? bUser.userId ?? bUser.id) as string,
          name: (tUser.name ?? token.name ?? bUser.name) as string,
          email: (tUser.email ?? token.email ?? bUser.email) as string,
          image,
          role: (tUser.role ?? token.role ?? bUser.role) as string,
          isApproved: (tUser.isApproved ?? token.isApproved ?? bUser.isApproved) as boolean,
          isActive: (tUser.isActive ?? token.isActive ?? bUser.isActive) as boolean,
        };

        // Ensure all image field variants are consistent
        const bu = base.user as ExtendedUser;
        bu.photoUrl = image;
        bu.profileImage = image;
        
        // Pass access token to the session for API calls
        (base as any).accessToken = (token as any).accessToken;
      }

      return base;
    },
  },
};

const handler = NextAuth(enhancedAuthOptions);

export { handler as GET, handler as POST };