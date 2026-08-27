'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Banknote, Eye, Filter, RefreshCw } from 'lucide-react';
import { apiGet } from '@/lib/api/client';
import { ResourceListMeta } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DriverRow { id: number; driver_code: string; driver_type: string; employment_relation: string; person?: { full_name?: string }; ledger: Record<string, number | string | null> }
const optionSets = {
  type: [['all', 'All driver types'], ['boda', 'Boda riders'], ['car', 'Car drivers']],
  state: [['all', 'All balances'], ['arrears', 'In arrears'], ['grace', 'Under grace'], ['credit', 'Has credit'], ['no_payment_today', 'No payment today'], ['no_payment_this_week', 'No payment this week']],
  frequency: [['all', 'All frequencies'], ['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['custom', 'Custom']],
};
export function RemittanceDrivers() {
  const params = useSearchParams();
  const [filters, setFilters] = useState({ type: params.get('type') || 'all', state: params.get('state') || 'all', frequency: params.get('frequency') || 'all' });
  const [page, setPage] = useState(1);
  const queryString = useMemo(() => { const params = new URLSearchParams({ page: String(page), per_page: '25' }); Object.entries(filters).forEach(([key, value]) => value !== 'all' && params.set(key, value)); return params.toString(); }, [filters, page]);
  const query = useQuery({ queryKey: ['remittance-drivers', queryString], queryFn: () => apiGet<DriverRow[]>(`remittance/drivers?${queryString}`), placeholderData: (previous) => previous });
  const meta = query.data?.meta as unknown as ResourceListMeta | undefined;
  return <div className="mx-auto max-w-[1600px] space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge variant="primary" appearance="light">Active contracts only</Badge><h1 className="mt-2 text-2xl font-semibold">Assigned Drivers & Riders</h1><p className="mt-1 text-sm text-muted-foreground">Operational balances calculated from contract start, payment allocation, waivers and welfare.</p></div><Button asChild><Link href="/ops/remittance/payments/create"><Banknote />Record payment</Link></Button></div>
    <Card><CardHeader><div><CardTitle>Remittance portfolio</CardTitle><CardDescription>{meta?.total || 0} active assigned drivers and riders</CardDescription></div><div className="flex flex-wrap gap-2"><Filter className="mt-2 size-4 text-muted-foreground" />{Object.entries(optionSets).map(([key, options]) => <Select key={key} value={filters[key as keyof typeof filters]} onValueChange={(value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); }}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>{options.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>)}<Button mode="icon" variant="outline" onClick={() => void query.refetch()}><RefreshCw className={query.isFetching ? 'animate-spin' : ''} /></Button></div></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Driver / Rider</TableHead><TableHead>Type</TableHead><TableHead>Total paid</TableHead><TableHead>Owed</TableHead><TableHead>Credit</TableHead><TableHead>Welfare</TableHead><TableHead>Arrears days</TableHead><TableHead /></TableRow></TableHeader><TableBody>{query.data?.data.length ? query.data.data.map((driver) => <TableRow key={driver.id}><TableCell><p className="font-medium">{driver.person?.full_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{driver.driver_code}</p></TableCell><TableCell>{driver.driver_type} / {driver.employment_relation?.replaceAll('_', ' ')}</TableCell><TableCell>{Number(driver.ledger.total_paid || 0).toLocaleString()}</TableCell><TableCell className={Number(driver.ledger.total_owed || 0) > 0 ? 'font-medium text-destructive' : ''}>{Number(driver.ledger.total_owed || 0).toLocaleString()}</TableCell><TableCell>{Number(driver.ledger.credit_balance || 0).toLocaleString()}</TableCell><TableCell>{Number(driver.ledger.welfare_outstanding || 0).toLocaleString()}</TableCell><TableCell>{String(driver.ledger.days_in_arrears || 0)}</TableCell><TableCell><div className="flex justify-end gap-1"><Button asChild size="sm" variant="outline"><Link href={`/ops/remittance/drivers/${driver.id}`}><Eye />Profile</Link></Button><Button asChild size="sm"><Link href={`/ops/remittance/payments/create?driver_id=${driver.id}`}><Banknote />Pay</Link></Button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">{query.isLoading ? 'Loading assigned drivers…' : 'No assigned drivers match these filters.'}</TableCell></TableRow>}</TableBody></Table><div className="flex items-center justify-between border-t px-5 py-3 text-sm text-muted-foreground"><span>Page {meta?.current_page || page} of {meta?.last_page || 1}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= (meta?.last_page || 1)} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></CardContent></Card>
  </div>;
}
