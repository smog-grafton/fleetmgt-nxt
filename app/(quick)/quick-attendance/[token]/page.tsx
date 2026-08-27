import { openQuickEntry } from '@/lib/quick-entry';

export default async function QuickAttendancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return openQuickEntry('quick-attendance', token);
}
