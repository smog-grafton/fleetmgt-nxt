'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Plus, UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { allNavigationItems, canAccessPath, quickActions } from '@/config/zuri-navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GlobalSearch } from './global-search';
import { SidebarNav } from './sidebar-nav';
import { ThemeSwitcher } from './theme-switcher';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [activity, setActivity] = useState(false);
  const current = [...allNavigationItems].sort((a, b) => b.path.length - a.path.length).find((item) => path === item.path || path.startsWith(`${item.path}/`));
  return <div className="min-h-screen bg-muted/25">
    <aside className={cn('fixed inset-y-0 start-0 z-30 hidden flex-col bg-zinc-950 text-white transition-[width] lg:flex', collapsed ? 'w-[76px]' : 'w-[280px]')}>
      <div className={cn('flex h-16 items-center border-b border-white/10 px-5', collapsed && 'justify-center px-2')}><Link href="/dashboard" className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-500 font-black text-zinc-950">Z</span>{!collapsed && <div><p className="text-sm font-semibold">Zuri Management</p><p className="text-[10px] text-zinc-500">OPERATIONS V2</p></div>}</Link></div>
      <div className="min-h-0 flex-1 overflow-y-auto"><SidebarNav compact={collapsed} /></div>
      <div className="border-t border-white/10 p-3"><Button variant="ghost" className="w-full text-zinc-400 hover:bg-white/10 hover:text-white" onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight /> : <><ChevronLeft />Collapse sidebar</>}</Button></div>
    </aside>
    <div className={cn('transition-[padding] lg:ps-[280px]', collapsed && 'lg:ps-[76px]')}>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur lg:px-6">
        <div className="flex min-w-0 items-center gap-3"><Button variant="ghost" mode="icon" className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu /></Button><div className="min-w-0"><p className="truncate text-sm font-semibold">{current?.title || 'Zuri Management'}</p><p className="hidden truncate text-xs text-muted-foreground sm:block">Live Operations V2 workspace</p></div></div>
        <div className="flex items-center gap-1.5"><GlobalSearch /><DropdownMenu><DropdownMenuTrigger asChild><Button><Plus />Quick add</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>Create a record</DropdownMenuLabel>{quickActions.filter((item) => canAccessPath(item.path, user)).map((item) => <DropdownMenuItem key={item.path} asChild><Link href={item.path}><item.icon />{item.title}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><Button variant="ghost" mode="icon" onClick={() => setActivity(true)} aria-label="Open control panel"><Bell /></Button><ThemeSwitcher /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="gap-2"><span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{user?.name?.slice(0, 1).toUpperCase() || <UserRound />}</span><span className="hidden max-w-28 truncate md:block">{user?.name || 'Account'}</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-60"><DropdownMenuLabel><span className="block truncate">{user?.name}</span><span className="block truncate text-xs font-normal text-muted-foreground">{user?.email}</span></DropdownMenuLabel><DropdownMenuSeparator />{canAccessPath('/settings/operations', user) && <DropdownMenuItem asChild><Link href="/settings/operations"><UserRound />Workspace settings</Link></DropdownMenuItem>}<DropdownMenuItem variant="destructive" onSelect={() => void logout()}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
      </header>
      <main className="min-h-[calc(100vh-7.5rem)] p-4 lg:p-6">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t bg-background px-6 py-4 text-xs text-muted-foreground"><span>© {new Date().getFullYear()} Zuri Ride · Management V2</span><span>Laravel Operations API · Metronic 9.5 UI</span></footer>
    </div>
    <Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left" className="w-[290px] gap-0 bg-zinc-950 p-0 text-white" close={false}><SheetHeader className="border-b border-white/10 p-4 text-start"><SheetTitle className="text-white">Zuri Management</SheetTitle><SheetDescription className="text-zinc-500">Operations V2</SheetDescription></SheetHeader><SheetBody className="min-h-0 overflow-y-auto p-0"><SidebarNav onVisit={() => setMobile(false)} /></SheetBody></SheetContent></Sheet>
    <Sheet open={activity} onOpenChange={setActivity}><SheetContent className="w-full sm:max-w-md"><SheetHeader><SheetTitle>Control panel</SheetTitle><SheetDescription>Fast access to the queues that need attention.</SheetDescription></SheetHeader><SheetBody className="space-y-4">{[
      ['Open alerts', '/ops/manage/alerts', 'Review compliance and operating exceptions'],
      ['Remittance arrears', '/ops/remittance/assigned?state=arrears', 'Follow up driver and rider balances'],
      ['Assignment approvals', '/ops/manage/assignment-approvals', 'Complete release-gate approvals'],
      ['Leave requests', '/ops/manage/leave-requests', 'Review pending HR requests'],
    ].map(([title, href, detail]) => <Link key={href} href={href} onClick={() => setActivity(false)} className="block rounded-xl border p-4 transition-colors hover:bg-muted"><div className="flex items-center justify-between"><span className="font-medium">{title}</span><Badge variant="secondary" appearance="light">Open</Badge></div><p className="mt-1 text-sm text-muted-foreground">{detail}</p></Link>)}</SheetBody></SheetContent></Sheet>
  </div>;
}
