import NextAuth, { type NextAuthOptions } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * We wrap your existing authOptions and safely extend callbacks
 * so role/userId/isApproved are always available in JWT + session.
 */
const enhancedAuthOptions: NextAuthOptions = {
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,

    async jwt(params) {
      // Run your existing jwt callback first (if any)
      const base = authOptions.callbacks?.jwt
        ? await authOptions.callbacks.jwt(params as any)
        : params.token;

      const { user } = params as any;

      // When user logs in (Credentials provider), `user` is available
      if (user) {
        (base as any).userId = user.userId || user.id || user._id || (base as any).userId;
        (base as any).role = user.role ?? (base as any).role;
        (base as any).isApproved = user.isApproved ?? (base as any).isApproved;
        (base as any).isActive = user.isActive ?? (base as any).isActive;
        (base as any).email = user.email ?? (base as any).email;
        (base as any).name = user.name ?? (base as any).name;
      }

      return base;
    },

    async session(params) {
      // Run your existing session callback first (if any)
      const base = authOptions.callbacks?.session
        ? await authOptions.callbacks.session(params as any)
        : params.session;

      const { token } = params as any;

      // Ensure these exist on session.user
      if (base?.user) {
        (base.user as any).userId = (token as any)?.userId ?? (base.user as any).userId;
        (base.user as any).role = (token as any)?.role ?? (base.user as any).role;
        (base.user as any).isApproved = (token as any)?.isApproved ?? (base.user as any).isApproved;
        (base.user as any).isActive = (token as any)?.isActive ?? (base.user as any).isActive;
      }

      return base;
    },
  },
};

const handler = NextAuth(enhancedAuthOptions);

export { handler as GET, handler as POST };
