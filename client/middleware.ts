import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const role = nextauth.token?.role as string;
    const pathname = nextUrl.pathname;

    if (pathname === '/dashboard/editProfile') {
      return NextResponse.next();
    }

    if (pathname.startsWith('/dashboard')) {
      if (role !== 'admin' && role !== 'superadmin') {
        const target = role === 'driver' ? '/driver-dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(target, req.url));
      }
    } else if (pathname.startsWith('/driver-dashboard')) {
      if (role !== 'driver') {
        const target = (role === 'admin' || role === 'superadmin') ? '/dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(target, req.url));
      }
    } else if (pathname.startsWith('/user-dashboard')) {
      if (role !== 'user' && role !== 'student') {
        const target = role === 'driver' ? '/driver-dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(target, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/driver-dashboard/:path*',
    '/user-dashboard/:path*',
  ],
};
