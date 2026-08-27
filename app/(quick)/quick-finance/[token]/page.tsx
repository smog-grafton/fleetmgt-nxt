import { openQuickEntry } from '@/lib/quick-entry';

export default async function QuickFinancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return openQuickEntry('quick-finance', token);
}
