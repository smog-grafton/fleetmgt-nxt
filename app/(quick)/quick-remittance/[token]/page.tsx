import { openQuickEntry } from '@/lib/quick-entry';

export default async function QuickRemittancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return openQuickEntry('quick-remittance', token);
}
