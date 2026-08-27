import { openQuickEntry } from '@/lib/quick-entry';

export default async function QuickIncomePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { token } = await params;
  const { q } = await searchParams;
  return openQuickEntry('quick-income', token, Array.isArray(q) ? q[0] : q);
}
