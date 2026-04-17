import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session-crypto';

const publicRoutes = ['/login', '/signup'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  // Redirect unauthenticated users to login
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect authenticated users away from login/signup
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/profile-select', req.nextUrl));
  }

  // If authenticated but no active profile, redirect to profile select
  // (except on the profile-select page itself)
  if (session && !session.activeProfileId && path !== '/profile-select' && !isPublicRoute) {
    return NextResponse.redirect(new URL('/profile-select', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js|symbols|uploads).*)'],
};
