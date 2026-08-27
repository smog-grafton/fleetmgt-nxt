import { ReactNode, Suspense } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { AppProviders } from '@/providers/app-providers';

import '@/styles/globals.css';
export const metadata: Metadata = {
  title: {
    template: '%s | Zuri Management',
    default: 'Zuri Management V2',
  },
  description: 'Zuri Ride operations, people, remittance, fleet and finance management.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background text-base text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="zuri-management-theme"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <TooltipProvider delayDuration={0}>
            <AppProviders>
              <Suspense>{children}</Suspense>
            </AppProviders>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
