import NextAuth, { type NextAuthOptions, type Session, type User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth-options';

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
}

/**
 * We wrap your existing authOptions and safely extend callbacks
 * so role/userId/isApproved are always available in JWT + session.
 */
const enhancedAuthOptions: NextAuthOptions = {
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,

    async jwt({ token, user, account, profile, trigger, session }): Promise<JWT> {
      const baseJwtCb = authOptions.callbacks?.jwt;
      const base = baseJwtCb
        ? await baseJwtCb({ token, user, account, profile, trigger, session })
        : token;

      const nextToken: JWT = { ...base };

      if (trigger === 'update' && session) {
        const sUser = session.user as ExtendedUser | undefined;
        const newName = sUser?.name ?? nextToken.name;
        const newImage = (sUser?.image ??
          sUser?.photoUrl ??
          sUser?.profileImage ??
          nextToken.image) as string | null | undefined;

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

      if (user) {
        const u = user as ExtendedUser & NextAuthUser;
        const image = (u.profileImage ?? u.image ?? u.photoUrl ?? nextToken.image) as
          | string
          | null
          | undefined;

        nextToken.userId = u.userId || u._id || u.id || nextToken.userId;
        nextToken.role = u.role ?? nextToken.role;
        nextToken.isApproved = u.isApproved ?? nextToken.isApproved;
        nextToken.isActive = u.isActive ?? nextToken.isActive;
        nextToken.email = u.email ?? nextToken.email;
        nextToken.name = u.name ?? nextToken.name;
        nextToken.image = image;

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
      const baseSessionCb = authOptions.callbacks?.session;
      const base = baseSessionCb
        ? ((await baseSessionCb({ session, token, user, trigger, newSession })) as Session)
        : (session as Session);

      if (base?.user) {
        const tUser = (token.user ?? {}) as ExtendedUser;
        const bUser = base.user as ExtendedUser;
        const image = (tUser.image ?? token.image ?? bUser.image) as string | null | undefined;

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

        // Synchronize all image variants in session.user
        if (base.user) {
          const bu = base.user as ExtendedUser;
          bu.photoUrl = image as string | null | undefined;
          bu.profileImage = image as string | null | undefined;
        }
      }

      return base;
    },
  },
};

const handler = NextAuth(enhancedAuthOptions);

export { handler as GET, handler as POST };
