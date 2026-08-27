import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, CSRF_COOKIE } from '@/lib/auth/constants';
import { laravelApiUrl } from '@/lib/api/server';

type RouteContext = { params: Promise<{ path: string[] }> };
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

async function proxy(request: NextRequest, context: RouteContext) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated.', data: [], meta: {} }, { status: 401 });

  const method = request.method.toUpperCase();
  if (!SAFE_METHODS.has(method)) {
    const cookieCsrf = request.cookies.get(CSRF_COOKIE)?.value;
    const headerCsrf = request.headers.get('x-csrf-token');
    if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
      return NextResponse.json({ success: false, message: 'Your security token expired. Refresh and try again.', data: [], meta: {} }, { status: 419 });
    }
  }

  const { path } = await context.params;
  if (!path?.length || path.some((segment) => !segment || segment === '.' || segment === '..')) {
    return NextResponse.json({ success: false, message: 'Invalid API path.', data: [], meta: {} }, { status: 400 });
  }

  const query = new URL(request.url).search;
  const headers = new Headers({ Accept: request.headers.get('accept') || 'application/json', Authorization: `Bearer ${token}` });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const init: RequestInit = { method, headers, cache: 'no-store' };
  if (!SAFE_METHODS.has(method)) init.body = await request.arrayBuffer();

  const upstream = await fetch(`${laravelApiUrl(path.join('/'))}${query}`, init).catch(() => null);
  if (!upstream) {
    return NextResponse.json({ success: false, message: 'The Laravel API is unavailable.', data: [], meta: {} }, { status: 503 });
  }

  const responseHeaders = new Headers();
  responseHeaders.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
  responseHeaders.set('Cache-Control', 'no-store');
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders.set('Content-Disposition', disposition);
  const response = new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
  if (upstream.status === 401) {
    response.cookies.delete(AUTH_COOKIE);
    response.cookies.delete(CSRF_COOKIE);
  }
  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
