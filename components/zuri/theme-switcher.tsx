'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" mode="icon" aria-label="Choose theme"><Sun className="dark:hidden" /><Moon className="hidden dark:block" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setTheme('light')}><Sun />Light</DropdownMenuItem><DropdownMenuItem onSelect={() => setTheme('dark')}><Moon />Dark</DropdownMenuItem><DropdownMenuItem onSelect={() => setTheme('system')}><Laptop />System</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
