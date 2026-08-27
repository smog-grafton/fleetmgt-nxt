'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Banknote, LoaderCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DriverRow { id: number; driver_code: string; person?: { full_name?: string }; ledger: Record<string, number> }
export function RemittancePaymentForm() {
  const search = useSearchParams(); const router = useRouter();
  const drivers = useQuery({ queryKey: ['remittance-drivers-payment'], queryFn: () => apiGet<DriverRow[]>('remittance/drivers?per_page=100') });
  const [driverId, setDriverId] = useState(search.get('driver_id') || '');
  const [autoAllocate, setAutoAllocate] = useState(true); const [storeCredit, setStoreCredit] = useState(true);
  const selected = useMemo(() => drivers.data?.data.find((driver) => String(driver.id) === driverId), [drivers.data, driverId]);
  const mutation = useMutation({ mutationFn: (body: Record<string, unknown>) => apiPost('remittance/payments', body), onSuccess: (result) => { toast.success(result.message); router.push(`/ops/remittance/drivers/${driverId}`); } });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); mutation.mutate({ ...body, driver_id: Number(driverId), amount: String(body.amount), auto_allocate: autoAllocate, store_credit: storeCredit }); }
  return <div className="mx-auto max-w-4xl space-y-5"><div><Badge variant="success" appearance="light">Controlled allocation</Badge><h1 className="mt-2 text-2xl font-semibold">Record Remittance Payment</h1><p className="mt-1 text-sm text-muted-foreground">Posts one auditable payment batch and allocates it against the correct contract calendar.</p></div>
    {selected && <Alert><ShieldCheck /><AlertDescription><strong>{selected.person?.full_name || selected.driver_code}</strong> currently owes UGX {Number(selected.ledger.total_owed || 0).toLocaleString()}, has credit UGX {Number(selected.ledger.credit_balance || 0).toLocaleString()}, and welfare UGX {Number(selected.ledger.welfare_outstanding || 0).toLocaleString()}.</AlertDescription></Alert>}
    <Card><CardHeader><div><CardTitle>Payment details</CardTitle><CardDescription>Review the driver and amount carefully before posting.</CardDescription></div></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      {mutation.isError && <Alert variant="destructive" className="md:col-span-2"><AlertDescription>{mutation.error.message}</AlertDescription></Alert>}
      <div className="space-y-2 md:col-span-2"><Label>Driver / Rider</Label><Select value={driverId} onValueChange={setDriverId}><SelectTrigger><SelectValue placeholder="Select an assigned driver" /></SelectTrigger><SelectContent>{drivers.data?.data.map((driver) => <SelectItem key={driver.id} value={String(driver.id)}>{driver.driver_code} — {driver.person?.full_name || 'Unknown'}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="amount">Amount (UGX)</Label><Input id="amount" name="amount" type="number" min="1" step="0.01" required /></div><div className="space-y-2"><Label htmlFor="payment_date">Payment date</Label><Input id="payment_date" name="payment_date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required /></div>
      <div className="space-y-2"><Label>Payment method</Label><Select name="payment_method" defaultValue="cash"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['cash', 'mobile_money', 'bank', 'card', 'other'].map((method) => <SelectItem value={method} key={method}>{method.replaceAll('_', ' ')}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="reference">Reference</Label><Input id="reference" name="reference" placeholder="Receipt, transaction or bank reference" /></div>
      <label className="flex items-center gap-3 rounded-lg border p-4"><Checkbox checked={autoAllocate} onCheckedChange={(value) => setAutoAllocate(value === true)} /><span><span className="block text-sm font-medium">Auto allocate</span><span className="block text-xs text-muted-foreground">Apply to oldest eligible balances first.</span></span></label><label className="flex items-center gap-3 rounded-lg border p-4"><Checkbox checked={storeCredit} onCheckedChange={(value) => setStoreCredit(value === true)} /><span><span className="block text-sm font-medium">Store remaining credit</span><span className="block text-xs text-muted-foreground">Preserve overpayment for future due items.</span></span></label>
      <div className="space-y-2 md:col-span-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} /></div><div className="flex justify-end gap-2 md:col-span-2"><Button asChild variant="outline"><Link href="/ops/remittance/assigned"><ArrowLeft />Cancel</Link></Button><Button disabled={!driverId || mutation.isPending}>{mutation.isPending ? <LoaderCircle className="animate-spin" /> : <Banknote />}Post payment</Button></div>
    </form></CardContent></Card></div>;
}
