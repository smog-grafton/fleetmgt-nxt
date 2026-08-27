import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, CSRF_COOKIE } from '@/lib/auth/constants';
import { laravelApiUrl, readJson } from '@/lib/api/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthenticated.', data: [], meta: {} }, { status: 401 });
  }
  const upstream = await fetch(laravelApiUrl('auth/me'), {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).catch(() => null);
  if (!upstream) {
    return NextResponse.json(
      { success: false, message: 'The Laravel API is unavailable.', data: [], meta: {} },
      { status: 503 },
    );
  }
  const response = NextResponse.json(await readJson(upstream), { status: upstream.status });
  if (upstream.status === 401) {
    response.cookies.delete(AUTH_COOKIE);
    response.cookies.delete(CSRF_COOKIE);
  }
  return response;
}
