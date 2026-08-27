import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth/constants';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];
const QUICK_ENTRY_PATHS = [
  '/quick-remittance/',
  '/quick-finance/',
  '/quick-attendance/',
];

export type RouteAccess = 'public' | 'quick-entry' | 'protected';

export function routeAccess(pathname: string): RouteAccess {
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  )
    return 'public';
  if (QUICK_ENTRY_PATHS.some((path) => pathname.startsWith(path)))
    return 'quick-entry';
  return 'protected';
}

export function proxy(request: NextRequest) {
  if (routeAccess(request.nextUrl.pathname) !== 'protected')
    return NextResponse.next();
  if (!request.cookies.get(AUTH_COOKIE)?.value) {
    const login = new URL('/login', request.url);
    login.searchParams.set(
      'next',
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|media).*)'],
};
