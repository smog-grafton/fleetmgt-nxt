'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, CalendarRange, LoaderCircle, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api/client';
import { DashboardCard, DashboardPayload, DashboardTable } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const toneClass: Record<string, string> = {
  primary: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', danger: 'bg-red-500/10 text-red-600 dark:text-red-400', info: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

function valueAt(row: Record<string, unknown> | unknown[], index: number) {
  if (Array.isArray(row)) return row[index];
  return Object.values(row)[index];
}

function DashboardTableCard({ table }: { table: DashboardTable }) {
  return <Card><CardHeader><CardTitle>{table.title}</CardTitle><CardToolbar><Badge variant="secondary" appearance="light">Live</Badge></CardToolbar></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow>{table.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{table.rows.length ? table.rows.map((row, rowIndex) => <TableRow key={rowIndex}>{table.columns.map((_, index) => <TableCell key={index}>{String(valueAt(row, index) ?? '—')}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={table.columns.length} className="py-10 text-center text-muted-foreground">No records in this queue.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>;
}

export function DashboardWorkspace({ title, description, dashboard }: { title: string; description: string; dashboard: string }) {
  const queryClient = useQueryClient();
  const [dates, setDates] = useState({ from: '', to: '' });
  const suffix = dashboard === 'finance' && dates.from && dates.to ? `?date_from=${dates.from}&date_to=${dates.to}` : '';
  const query = useQuery({ queryKey: ['dashboard', dashboard, suffix], queryFn: () => apiGet<DashboardPayload>(`dashboard/${dashboard}${suffix}`) });
  const command = useMutation({
    mutationFn: () => apiPost(dashboard === 'finance' ? 'finance/sync' : 'alerts/refresh'),
    onSuccess: (result) => { toast.success(result.message); void queryClient.invalidateQueries({ queryKey: ['dashboard', dashboard] }); },
  });
  const chartData = useMemo(() => (query.data?.data.cards || []).slice(0, 10).map((card) => ({ name: card.label.length > 17 ? `${card.label.slice(0, 17)}…` : card.label, value: Number(String(card.value).replace(/,/g, '')) || 0 })), [query.data]);

  return <div className="mx-auto max-w-[1600px] space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><Badge variant="success" appearance="light">Operations V2</Badge><span className="text-xs text-muted-foreground">Updated live</span></div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><div className="flex flex-wrap gap-2">{dashboard === 'finance' && <><Input type="date" className="w-36" value={dates.from} onChange={(event) => setDates((value) => ({ ...value, from: event.target.value }))} aria-label="From date" /><Input type="date" className="w-36" value={dates.to} onChange={(event) => setDates((value) => ({ ...value, to: event.target.value }))} aria-label="To date" /></>}<Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching ? 'animate-spin' : ''} />Refresh</Button>{['finance', 'intelligence'].includes(dashboard) && <Button onClick={() => command.mutate()} disabled={command.isPending}>{command.isPending ? <LoaderCircle className="animate-spin" /> : dashboard === 'finance' ? <BarChart3 /> : <RefreshCw />}{dashboard === 'finance' ? 'Sync finance' : 'Refresh alerts'}</Button>}</div></div>
    {query.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28" />)}</div> : query.isError ? <Card><CardContent className="py-14 text-center"><p className="font-medium">Dashboard data could not be loaded.</p><p className="mt-1 text-sm text-muted-foreground">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Try again</Button></CardContent></Card> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{query.data?.data.cards.map((card: DashboardCard) => <Card key={card.label}><CardContent className="flex items-start justify-between p-5"><div><p className="text-xs font-medium text-muted-foreground">{card.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</p></div><span className={`grid size-9 place-items-center rounded-lg ${toneClass[card.tone || 'primary'] || toneClass.primary}`}>{card.tone === 'danger' ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}</span></CardContent></Card>)}</div>
      {chartData.length > 1 && <Card><CardHeader><div><CardTitle>Operating snapshot</CardTitle><CardDescription>Relative scale of the current headline indicators</CardDescription></div><CalendarRange className="size-5 text-muted-foreground" /></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ left: -15, right: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={55} /><YAxis tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} /><Bar dataKey="value" fill="var(--color-blue-500)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>}
      {query.data?.data.table && <DashboardTableCard table={query.data.data.table} />}
      <div className="grid gap-5 xl:grid-cols-2">{query.data?.data.resource_tables?.map((table) => <DashboardTableCard key={table.title} table={table} />)}</div>
    </>}
    <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/ops/manage/alerts">Review alerts</Link></Button><Button asChild variant="outline"><Link href="/ops/remittance">Open remittance</Link></Button><Button asChild variant="outline"><Link href="/ops/manage/finance-ledger">Finance ledger</Link></Button></div>
  </div>;
}
