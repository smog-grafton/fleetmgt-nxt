import { NextRequest, NextResponse } from 'next/server';
import { laravelApiUrl, readJson } from '@/lib/api/server';

export async function POST(request: NextRequest) {
  const upstream = await fetch(laravelApiUrl('auth/forgot-password'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(await request.json().catch(() => ({}))),
    cache: 'no-store',
  }).catch(() => null);
  if (!upstream) return NextResponse.json({ success: false, message: 'The Laravel API is unavailable.' }, { status: 503 });
  return NextResponse.json(await readJson(upstream), { status: upstream.status });
}
