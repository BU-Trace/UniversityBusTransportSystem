import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const role = nextauth.token?.role as string;
    const pathname = nextUrl.pathname;

    // 1. Allow access to shared dashboard routes (like editProfile) for all authenticated users
    if (pathname === '/dashboard/editProfile') {
      return NextResponse.next();
    }

    // 2. Role-based restrictions
    if (pathname.startsWith('/dashboard')) {
      // Only admin/superadmin can access /dashboard/ paths (except shared ones)
      if (role !== 'admin' && role !== 'superadmin') {
        const target = role === 'driver' ? '/driver-dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(target, req.url));
      }
    } else if (pathname.startsWith('/driver-dashboard')) {
      // Only drivers can access /driver-dashboard
      if (role !== 'driver') {
        const target = (role === 'admin' || role === 'superadmin') ? '/dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(target, req.url));
      }
    } else if (pathname.startsWith('/user-dashboard')) {
      // Only users/students can access /user-dashboard
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
