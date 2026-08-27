import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE } from '@/lib/auth/constants';
import { AppShell } from '@/components/zuri/app-shell';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  if (!(await cookies()).get(AUTH_COOKIE)?.value) redirect('/login');
  return <AppShell>{children}</AppShell>;
}
