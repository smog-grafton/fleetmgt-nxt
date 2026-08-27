'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canAccessPath, navigation } from '@/config/zuri-navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-provider';

export function SidebarNav({ compact = false, onVisit }: { compact?: boolean; onVisit?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  return <nav className="space-y-6 px-3 py-5" aria-label="Main navigation">{navigation.map((section) => { const items = section.items.filter((item) => canAccessPath(item.path, user)); return items.length ? <section key={section.title}><h2 className={cn('mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-zinc-500', compact && 'sr-only')}>{section.title}</h2><div className="space-y-1">{items.map((item) => { const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`)); return <Link key={item.path} href={item.path} onClick={onVisit} title={compact ? item.title : undefined} className={cn('flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/7 hover:text-white', active && 'bg-green-500/15 text-green-400', compact && 'justify-center px-2')}><item.icon className="size-[18px] shrink-0" />{!compact && <span className="truncate">{item.title}</span>}</Link>; })}</div></section> : null; })}</nav>;
}
