'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { formatLabel, ValueDisplay } from '@/features/resources/value-display';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  Calculator,
  CalendarPlus,
  LoaderCircle,
  RefreshCw,
  Users,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SemanticMetric } from '@/components/zuri/semantic-metric';

interface Summary {
  totals: Record<string, unknown>;
  overdue: Array<Record<string, unknown>>;
  recent_payments: Array<Record<string, unknown>>;
}
function first(row: Record<string, unknown>, paths: string[]) {
  for (const path of paths) {
    const value = path
      .split('.')
      .reduce<unknown>(
        (current, key) =>
          current && typeof current === 'object'
            ? (current as Record<string, unknown>)[key]
            : undefined,
        row,
      );
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return '—';
}

export function RemittanceDashboard() {
  const client = useQueryClient();
  const [repairBusy, setRepairBusy] = useState('');
  const query = useQuery({
    queryKey: ['remittance-summary'],
    queryFn: () => apiGet<Summary>('remittance/summary'),
  });
  const generate = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiPost<{ rows: number }>('remittance/generate', body),
    onSuccess: (result) => {
      toast.success(`${result.message} ${result.data.rows} rows processed.`);
      void client.invalidateQueries({ queryKey: ['remittance-summary'] });
    },
  });
  const recalculate = useMutation({
    mutationFn: () => apiPost<Record<string, unknown>>('remittance/recalculate'),
    onSuccess: (result) => {
      toast.success(result.message);
      void client.invalidateQueries({ queryKey: ['remittance-summary'] });
    },
    onError: (error) => toast.error(error.message),
  });
  async function runRepair(label: string, path: string, confirmation: string) {
    setRepairBusy(label);
    try {
      const preview = await apiPost<Record<string, unknown>>(path, { dry_run: true });
      const details = Object.entries(preview.data)
        .filter(([, value]) => ['string', 'number'].includes(typeof value))
        .slice(0, 10)
        .map(([key, value]) => `${formatLabel(key)}: ${String(value)}`)
        .join('\n');
      if (!window.confirm(`${label} preview\n\n${details}\n\nApply this repair now?`)) return;
      const result = await apiPost(path, { dry_run: false, confirmation });
      toast.success(result.message);
      void client.invalidateQueries({ queryKey: ['remittance-summary'] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${label} failed.`);
    } finally {
      setRepairBusy('');
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generate.mutate(
      Object.fromEntries(new FormData(event.currentTarget)) as Record<
        string,
        string
      >,
    );
  }
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="success" appearance="light">
            Collections control
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">Remittance Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Expected amounts, payments, arrears, credit and welfare in one
            operational ledger.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/ops/remittance/assigned">
              <Users />
              Assigned drivers
            </Link>
          </Button>
          <Button asChild>
            <Link href="/ops/remittance/payments/create">
              <Banknote />
              Record payment
            </Link>
          </Button>
        </div>
      </div>
      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton className="h-28" key={i} />
          ))}
        </div>
      ) : query.isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p>{query.error.message}</p>
            <Button className="mt-4" onClick={() => void query.refetch()}>
              <RefreshCw />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(query.data?.data.totals || {})
              .filter(([, value]) => typeof value !== 'object')
              .map(([label, value]) => (
                <SemanticMetric key={label} label={label} value={value} />
              ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Overdue remittance</CardTitle>
                  <CardDescription>
                    Oldest unpaid due items requiring follow-up.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver / Rider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data?.data.overdue.length ? (
                      query.data.data.overdue.map((row) => (
                        <TableRow key={String(row.id)}>
                          <TableCell>
                            <Link
                              className="font-medium hover:underline"
                              href={`/ops/remittance/drivers/${row.driver_id}`}
                            >
                              {String(
                                first(row, [
                                  'driver.person.full_name',
                                  'driver.driver_code',
                                  'driver_id',
                                ]),
                              )}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {String(first(row, ['remittance_date']))}
                          </TableCell>
                          <TableCell>
                            <ValueDisplay value={row.expected_amount} />
                          </TableCell>
                          <TableCell>
                            <ValueDisplay value={row.actual_paid} />
                          </TableCell>
                          <TableCell>
                            <ValueDisplay
                              value={row.base_balance ?? row.balance}
                              field="overdue"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No overdue items.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent payments</CardTitle>
                  <CardDescription>
                    Newest payment batches posted.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data?.data.recent_payments.length ? (
                      query.data.data.recent_payments.map((row) => (
                        <TableRow key={String(row.id)}>
                          <TableCell>
                            {String(
                              first(row, [
                                'driver.person.full_name',
                                'driver_id',
                              ]),
                            )}
                          </TableCell>
                          <TableCell>
                            {String(first(row, ['payment_date']))}
                          </TableCell>
                          <TableCell>
                            {Number(row.amount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No payment batches.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ledger integrity and repair</CardTitle>
            <CardDescription>
              Repair actions run a read-only preview first and show the detected records before any write is confirmed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={recalculate.isPending || Boolean(repairBusy)} onClick={() => recalculate.mutate()}>
            {recalculate.isPending ? <LoaderCircle className="animate-spin" /> : <Calculator />}
            Recalculate active drivers
          </Button>
          <Button variant="outline" disabled={Boolean(repairBusy)} onClick={() => void runRepair('Repair all driver arrears', 'remittance/repair-arrears', 'REPAIR_ALL_ARREARS')}><Wrench />Repair driver arrears</Button>
          <Button variant="outline" disabled={Boolean(repairBusy)} onClick={() => void runRepair('Rebuild dues from active contract starts', 'remittance/rebuild-dues', 'REBUILD_ALL_ACTIVE_DUES')}><CalendarPlus />Rebuild dues</Button>
          <Button variant="outline" disabled={Boolean(repairBusy)} onClick={() => void runRepair('Repair all payment allocations', 'remittance/repair-payment-allocations', 'REPAIR_ALL_PAYMENT_ALLOCATIONS')}><Wrench />Repair allocations</Button>
          <Button variant="outline" disabled={Boolean(repairBusy)} onClick={() => void runRepair('Repair future paid days', 'remittance/repair-future-allocations', 'REPAIR_FUTURE_ALLOCATIONS')}><CalendarPlus />Repair future paid days</Button>
          <Button variant="outline" disabled={Boolean(repairBusy)} onClick={() => void runRepair('Sync finance records', 'remittance/sync-finance', 'SYNC_REMITTANCE_FINANCE')}><RefreshCw />Sync finance records</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Generate remittance calendar</CardTitle>
            <CardDescription>
              Refresh active car and boda contract due items for a controlled
              date range.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" required />
            </div>
            <Button disabled={generate.isPending}>
              {generate.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CalendarPlus />
              )}
              Generate calendar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
