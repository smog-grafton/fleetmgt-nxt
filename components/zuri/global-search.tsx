'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { allNavigationItems, canAccessPath, navigation } from '@/config/zuri-navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value); }
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);
  function visit(path: string) { setOpen(false); router.push(path); }
  return <>
    <Button variant="outline" className="hidden w-52 justify-between text-muted-foreground md:flex" onClick={() => setOpen(true)}><span className="flex items-center gap-2"><Search />Search</span><kbd className="text-[10px]">⌘K</kbd></Button>
    <Button variant="ghost" mode="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Search"><Search /></Button>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={`Search ${allNavigationItems.length} tools and pages…`} />
      <CommandList><CommandEmpty>No matching page.</CommandEmpty>{navigation.map((section) => { const items = section.items.filter((item) => canAccessPath(item.path, user)); return items.length ? <CommandGroup key={section.title} heading={section.title}>{items.map((item) => <CommandItem key={item.path} value={`${item.title} ${section.title}`} onSelect={() => visit(item.path)}><item.icon />{item.title}</CommandItem>)}</CommandGroup> : null; })}</CommandList>
    </CommandDialog>
  </>;
}
