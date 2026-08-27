import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, CSRF_COOKIE } from '@/lib/auth/constants';
import { laravelApiUrl } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token) {
    await fetch(laravelApiUrl('auth/logout'), {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => null);
  }
  const response = NextResponse.json({ success: true, message: 'Signed out.', data: [], meta: {} });
  response.cookies.delete(AUTH_COOKIE);
  response.cookies.delete(CSRF_COOKIE);
  return response;
}
