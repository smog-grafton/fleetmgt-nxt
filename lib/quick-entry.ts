import { notFound, redirect } from 'next/navigation';

export function openQuickEntry(
  kind: 'quick-remittance' | 'quick-finance' | 'quick-attendance',
  token: string,
): never {
  if (!/^[A-Za-z0-9_-]{6,255}$/.test(token)) notFound();
  const apiBase =
    process.env.LARAVEL_API_URL || 'http://localhost/zurimgt/api/v2';
  const webBase = (
    process.env.LARAVEL_WEB_URL || apiBase.replace(/\/api\/v2\/?$/, '')
  ).replace(/\/$/, '');
  redirect(`${webBase}/${kind}/${encodeURIComponent(token)}`);
}
