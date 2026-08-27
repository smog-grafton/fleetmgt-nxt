'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => console.error(error), [error]); return <div className="mx-auto max-w-xl py-20"><Card><CardContent className="py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle /></span><h1 className="mt-5 text-xl font-semibold">This workspace could not be rendered</h1><p className="mt-2 text-sm text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p><Button className="mt-5" onClick={reset}><RefreshCw />Try again</Button></CardContent></Card></div>; }
