import NextAuth, {
  type Account,
  type NextAuthOptions,
  type Profile,
  type Session,
  type User,
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth-options';

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

      if (user) {
        nextToken.userId =
          (user as User & { userId?: string; _id?: string }).userId ||
          (user as { _id?: string })._id ||
          (user as User).id ||
          nextToken.userId;
        nextToken.role = (user as { role?: string }).role ?? nextToken.role;
        nextToken.isApproved =
          (user as { isApproved?: boolean }).isApproved ?? nextToken.isApproved;
        nextToken.isActive = (user as { isActive?: boolean }).isActive ?? nextToken.isActive;
        nextToken.email = user.email ?? nextToken.email;
        nextToken.name = user.name ?? nextToken.name;
      }

      return nextToken;
    },

    async session({ session, token, user, trigger, newSession }): Promise<Session> {
      const baseSessionCb = authOptions.callbacks?.session;
      const base = baseSessionCb
        ? await baseSessionCb({ session, token, user, trigger, newSession })
        : session;

      if (base?.user) {
        base.user = {
          ...base.user,
          userId:
            (token as { userId?: string }).userId ?? (base.user as { userId?: string }).userId,
          role: (token as { role?: string }).role ?? (base.user as { role?: string }).role,
          isApproved:
            (token as { isApproved?: boolean }).isApproved ??
            (base.user as { isApproved?: boolean }).isApproved,
          isActive:
            (token as { isActive?: boolean }).isActive ??
            (base.user as { isActive?: boolean }).isActive,
        } as Session['user'];
      }

      return base;
    },
  },
};

const handler = NextAuth(enhancedAuthOptions);

export { handler as GET, handler as POST };
