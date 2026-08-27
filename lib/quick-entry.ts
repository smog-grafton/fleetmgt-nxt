import { notFound, redirect } from 'next/navigation';

export function openQuickEntry(
  kind:
    | 'quick-remittance'
    | 'quick-income'
    | 'quick-expense'
    | 'quick-finance'
    | 'quick-attendance',
  token: string,
  query?: string,
): never {
  if (!/^[A-Za-z0-9_-]{6,255}$/.test(token)) notFound();
  const apiBase =
    process.env.LARAVEL_API_URL || 'http://localhost/zurimgt/api/v2';
  const webBase = (
    process.env.LARAVEL_WEB_URL || apiBase.replace(/\/api\/v2\/?$/, '')
  ).replace(/\/$/, '');
  const suffix = query?.trim()
    ? `?q=${encodeURIComponent(query.trim().slice(0, 100))}`
    : '';
  redirect(`${webBase}/${kind}/${encodeURIComponent(token)}${suffix}`);
}

export function openQuickTool(
  kind: 'quick-remittance' | 'quick-income' | 'quick-expense',
): never {
  const apiBase =
    process.env.LARAVEL_API_URL || 'http://localhost/zurimgt/api/v2';
  const webBase = (
    process.env.LARAVEL_WEB_URL || apiBase.replace(/\/api\/v2\/?$/, '')
  ).replace(/\/$/, '');
  redirect(`${webBase}/${kind}`);
}
