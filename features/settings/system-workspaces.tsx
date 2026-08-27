'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, RefreshCw } from 'lucide-react';
import { apiGet } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CatalogItem { slug: string; label: string; singular: string; group: string; actions: Record<string, string> }
export function HealthWorkspace() {
  const query = useQuery({ queryKey: ['api-health'], queryFn: () => apiGet<Record<string, unknown>>('health') });
  return <div className="mx-auto max-w-3xl space-y-5"><div><Badge variant="success" appearance="light">System</Badge><h1 className="mt-2 text-2xl font-semibold">API Health</h1></div><Card><CardHeader><div><CardTitle>Laravel Operations V2</CardTitle><CardDescription>Connectivity through the protected Next.js backend-for-frontend.</CardDescription></div><Button mode="icon" variant="outline" onClick={() => void query.refetch()}><RefreshCw className={query.isFetching ? 'animate-spin' : ''} /></Button></CardHeader><CardContent>{query.isLoading ? <Skeleton className="h-28" /> : <div className="grid gap-3 sm:grid-cols-2">{Object.entries(query.data?.data || {}).map(([key, value]) => <div key={key} className="rounded-lg border p-4"><p className="text-xs uppercase text-muted-foreground">{key.replaceAll('_', ' ')}</p><p className="mt-2 font-medium">{String(value)}</p></div>)}</div>}</CardContent></Card></div>;
}
export function CatalogWorkspace() {
  const query = useQuery({ queryKey: ['resource-catalog'], queryFn: () => apiGet<CatalogItem[]>('resources') });
  return <div className="mx-auto max-w-5xl space-y-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Database /></span><div><h1 className="text-2xl font-semibold">Operations Data Catalog</h1><p className="text-sm text-muted-foreground">Authoritative V2 resources currently exposed to the management application.</p></div></div><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Resource</TableHead><TableHead>Group</TableHead><TableHead>Slug</TableHead><TableHead>Workflow actions</TableHead></TableRow></TableHeader><TableBody>{query.data?.data.map((item) => <TableRow key={item.slug}><TableCell className="font-medium">{item.label}</TableCell><TableCell>{item.group}</TableCell><TableCell className="font-mono text-xs">{item.slug}</TableCell><TableCell>{Object.keys(item.actions).length ? Object.values(item.actions).join(', ') : 'Standard CRUD'}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card><div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="size-4" />{query.data?.data.length || 0} API-managed resource modules</div></div>;
}
