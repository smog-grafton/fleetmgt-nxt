import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, CSRF_COOKIE, TOKEN_MAX_AGE } from '@/lib/auth/constants';
import { laravelApiUrl, readJson } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const upstream = await fetch(laravelApiUrl('auth/login'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json(
      { success: false, message: 'The Laravel API is unavailable.', data: [], meta: {} },
      { status: 503 },
    );
  }

  const payload = await readJson(upstream);
  const accessToken = payload?.data?.access_token;
  if (accessToken) delete payload.data.access_token;
  const response = NextResponse.json(payload, { status: upstream.status });
  if (upstream.ok && payload?.success && accessToken) {
    const secure = process.env.NODE_ENV === 'production';
    response.cookies.set(AUTH_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    });
    response.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    });
  }
  return response;
}
