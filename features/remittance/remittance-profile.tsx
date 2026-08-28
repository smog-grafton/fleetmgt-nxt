'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { formatLabel, ValueDisplay } from '@/features/resources/value-display';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Banknote,
  Calculator,
  CalendarOff,
  CircleDollarSign,
  Gavel,
  Pause,
  Play,
  RefreshCw,
  Scale,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api/client';
import { formatDate } from '@/lib/helpers';
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SemanticMetric } from '@/components/zuri/semantic-metric';

type Row = Record<string, unknown>;
type Action =
  | 'pause'
  | 'resume'
  | 'rate_change'
  | 'cash_waiver'
  | 'days_waiver'
  | 'manual_credit'
  | 'manual_debit'
  | 'penalty';
interface Preview {
  action: Action;
  affected_calendar_rows: number;
  current_owed: number;
  estimated_change: number;
  estimated_owed: number;
  warning?: string;
  details: Row;
}
interface Profile {
  driver: Row & { id: number; person?: Row };
  ledger: Row;
  calendar: Row[];
  payments: Row[];
  welfare_funds: Row[];
  contracts: Row[];
  boda_contracts: Row[];
  rates: Row[];
  pauses: Row[];
  adjustments: Row[];
  penalties: Row[];
  timeline: Row[];
  assignments: Row[];
  documents: Row[];
  incidents: Row[];
}

const KPI_KEYS = [
  'total_expected',
  'total_paid',
  'total_owed',
  'credit_balance',
  'waived_amount',
  'penalties_outstanding',
  'welfare_outstanding',
];
const actionTitles: Record<Action, string> = {
  pause: 'Pause remittance',
  resume: 'Resume remittance',
  rate_change: 'Change remittance rate',
  cash_waiver: 'Cash waiver',
  days_waiver: 'Waive date range',
  manual_credit: 'Credit balance',
  manual_debit: 'Debit balance',
  penalty: 'Add penalty',
};
const moneyActions: Action[] = [
  'rate_change',
  'cash_waiver',
  'manual_credit',
  'manual_debit',
  'penalty',
];
function money(value: unknown) {
  return `UGX ${Number(value || 0).toLocaleString()}`;
}
function text(row: Row, key: string) {
  return String(row[key] ?? '—');
}

export function RemittanceProfile({ driverId }: { driverId: number }) {
  const client = useQueryClient();
  const [action, setAction] = useState<Action | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [payload, setPayload] = useState<Row | null>(null);
  const query = useQuery({
    queryKey: ['remittance-profile', driverId],
    queryFn: () => apiGet<Profile>(`remittance/drivers/${driverId}`),
  });
  const refresh = () =>
    void client.invalidateQueries({
      queryKey: ['remittance-profile', driverId],
    });
  const recalc = useMutation({
    mutationFn: () => apiPost(`remittance/drivers/${driverId}/recalculate`),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });
  const previewAction = useMutation({
    mutationFn: (body: Row) =>
      apiPost<Preview>(`remittance/drivers/${driverId}/actions/preview`, body),
    onSuccess: (result) => setPreview(result.data),
    onError: (error) => toast.error(error.message),
  });
  const commitAction = useMutation({
    mutationFn: (body: Row) =>
      apiPost(`remittance/drivers/${driverId}/actions`, {
        ...body,
        confirmed: true,
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setAction(null);
      setPreview(null);
      setPayload(null);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const reversePayment = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiPost(`remittance/payments/${id}/reverse`, {
        confirmation: 'REVERSE_PAYMENT_BATCH',
        reason,
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  function open(next: Action) {
    setAction(next);
    setPreview(null);
    setPayload(null);
  }
  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const normalized = {
      ...body,
      action,
      effective_until: body.effective_until || undefined,
      amount: body.amount || undefined,
    };
    setPayload(normalized);
    previewAction.mutate(normalized);
  }

  if (query.isLoading)
    return (
      <div className="space-y-5">
        <Skeleton className="h-24" />
        <Skeleton className="h-80" />
      </div>
    );
  if (!query.data)
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p>{query.error?.message || 'Driver profile not found.'}</p>
          <Button className="mt-4" asChild>
            <Link href="/ops/remittance/assigned">
              Back to assigned drivers
            </Link>
          </Button>
        </CardContent>
      </Card>
    );

  const data = query.data.data;
  const { driver, ledger, calendar, payments } = data;
  const person = driver.person || {};
  const contract = data.boda_contracts[0] || data.contracts[0] || {};
  const activePause = data.pauses.find(
    (row) => row.status === 'active' && !row.reversed_at,
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserRound />
          </span>
          <div>
            <Badge
              variant={activePause ? 'warning' : 'success'}
              appearance="light"
            >
              {activePause
                ? 'Remittance paused'
                : String(driver.approval_status || 'driver')}
            </Badge>
            <h1 className="mt-1 text-2xl font-semibold">
              {String(
                person.full_name || driver.driver_code || `Driver #${driverId}`,
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {String(driver.driver_code || '')} ·{' '}
              {String(driver.driver_type || '')} ·{' '}
              {String(driver.employment_relation || '').replaceAll('_', ' ')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link
              href={`/ops/remittance/payments/create?driver_id=${driverId}`}
            >
              <Banknote />
              Record payment
            </Link>
          </Button>
          {activePause ? (
            <Button variant="outline" onClick={() => open('resume')}>
              <Play />
              Resume
            </Button>
          ) : (
            <Button variant="outline" onClick={() => open('pause')}>
              <Pause />
              Pause
            </Button>
          )}
          <Button variant="outline" onClick={() => open('rate_change')}>
            <CircleDollarSign />
            Change rate
          </Button>
          <Button variant="outline" onClick={() => open('cash_waiver')}>
            <CalendarOff />
            Waiver
          </Button>
          <Button variant="outline" onClick={() => open('manual_credit')}>
            <Scale />
            Adjust balance
          </Button>
          <Button variant="outline" onClick={() => open('penalty')}>
            <Gavel />
            Penalty
          </Button>
          <Button
            variant="outline"
            onClick={() => recalc.mutate()}
            disabled={recalc.isPending}
          >
            <Calculator />
            Recalculate
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {KPI_KEYS.map((key) => (
          <SemanticMetric
            key={key}
            label={key}
            value={Number(ledger[key] || 0)}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <div className="overflow-x-auto">
          <TabsList variant="line" className="min-w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="rates">Rates & pauses</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            {data.assignments.length +
              data.documents.length +
              data.incidents.length >
              0 && (
              <TabsTrigger value="operations">Vehicle & documents</TabsTrigger>
            )}
            <TabsTrigger value="timeline">Audit timeline</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Profile & credentials</CardTitle>
                  <CardDescription>
                    Identity and operational readiness.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {Object.entries({
                  'Driver code': driver.driver_code,
                  'Full name': person.full_name,
                  Phone: person.phone,
                  'Alternative phone': person.alternative_phone,
                  Email: person.email,
                  Address: person.address,
                  'National ID / NIN': person.national_id_number,
                  'Driver status': driver.approval_status,
                  'Academy status': driver.academy_status,
                  'Arrears days': ledger.days_in_arrears,
                  'Last payment': ledger.last_payment_date,
                }).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {label}
                    </p>
                    <div className="mt-1 text-sm font-medium">
                      <ValueDisplay value={value} field={label === 'Last payment' ? 'last_payment_date' : label} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-sky-500/20 bg-sky-500/[0.035]">
              <CardHeader>
                <div>
                  <CardTitle>Active contract</CardTitle>
                  <CardDescription>
                    The agreement currently driving this ledger.
                  </CardDescription>
                </div>
                <Badge variant="success" appearance="light">
                  {text(contract, 'status')}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                {Object.entries({
                  Reference: contract.reference || contract.id,
                  Type: contract.contract_type,
                  Frequency:
                    contract.remittance_frequency || contract.contract_type,
                  'Current rate':
                    contract.daily_rate ||
                    contract.expected_amount_per_period ||
                    contract.rate_amount,
                  Starts: contract.start_date || contract.starts_at,
                  Ends: contract.end_date || contract.ends_at,
                  Vehicle:
                    (contract.asset as Row | undefined)?.number_plate ||
                    (contract.asset as Row | undefined)?.registration_number ||
                    (contract.asset as Row | undefined)?.asset_code ||
                    contract.fleet_asset_id,
                  'Off day':
                    contract.default_off_day ||
                    (contract.off_days as unknown[] | undefined)?.join(', '),
                  'Grace hours': contract.grace_period_hours,
                }).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border bg-background/70 p-3"
                  >
                    <p className="text-[10px] uppercase text-muted-foreground">
                      {label}
                    </p>
                    <div className="mt-1 text-sm font-medium">
                      <ValueDisplay value={value} field={label === 'Starts' ? 'starts_at' : label === 'Ends' ? 'ends_at' : label} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Transparent balance breakdown</CardTitle>
                <CardDescription>
                  Welfare is shown separately and does not silently inflate base
                  remittance.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                'base_expected',
                'period_waivers',
                'cash_waivers',
                'manual_credits',
                'manual_charges',
                'penalties_outstanding',
                'total_paid',
                'total_owed',
                'welfare_expected',
                'welfare_paid',
                'welfare_outstanding',
              ].map((key) => (
                <SemanticMetric
                  key={key}
                  label={key}
                  value={Number(ledger[key] || 0)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Contract remittance calendar</CardTitle>
                <CardDescription>
                  {calendar.length} dated obligations; weekly periods remain
                  scheduled and do not affect the amount owed until they end.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="max-h-[620px] overflow-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Waived</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendar.map((day) => (
                    <TableRow key={text(day, 'id')}>
                      <TableCell className="whitespace-nowrap">{calendarPeriod(day)}</TableCell>
                      <TableCell><ValueDisplay value={day.due_at || day.period_ends_on} field={day.due_at ? 'due_at' : 'period_ends_on'} /></TableCell>
                      <TableCell>
                        {formatLabel(text(day, 'day_type'))}
                      </TableCell>
                      <TableCell>{money(day.expected_amount)}</TableCell>
                      <TableCell>{money(day.actual_paid)}</TableCell>
                      <TableCell>
                        {money(
                          Number(day.waived_amount || 0) +
                            Number(day.reduced_amount || 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={
                          baseBalance(day) > 0
                            ? 'font-semibold text-destructive'
                            : ''
                        }
                      >
                        {money(baseBalance(day))}
                      </TableCell>
                      <TableCell>
                        <ValueDisplay value={day.status} field="status" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment history</CardTitle>
                <CardDescription>
                  Posted and reversed batches remain visible for audit.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={text(payment, 'id')}>
                      <TableCell className="whitespace-nowrap">{formatDate(text(payment, 'payment_date'))}</TableCell>
                      <TableCell>{money(payment.amount)}</TableCell>
                      <TableCell>{money(payment.allocated_amount)}</TableCell>
                      <TableCell>{money(payment.credit_amount)}</TableCell>
                      <TableCell>
                        {formatLabel(text(payment, 'payment_method'))}
                      </TableCell>
                      <TableCell>
                        <ValueDisplay
                          value={payment.status || 'posted'}
                          field="status"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.status !== 'reversed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            disabled={reversePayment.isPending}
                            onClick={() => {
                              const reason = window.prompt(
                                'Reason for reversing this payment (the original record will remain visible):',
                              );
                              if (
                                reason &&
                                reason.trim().length >= 5 &&
                                window.confirm(
                                  'Reverse this payment and recalculate affected balances?',
                                )
                              )
                                reversePayment.mutate({
                                  id: Number(payment.id),
                                  reason: reason.trim(),
                                });
                            }}
                          >
                            Reverse
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="grid gap-5 xl:grid-cols-2">
          <DataCard
            title="Effective rate history"
            description="Each rate applies only inside its own date range."
            rows={data.rates}
            columns={[
              'effective_from',
              'effective_until',
              'amount',
              'frequency',
              'reason',
            ]}
          />
          <DataCard
            title="Pause history"
            description="Resume date is the first newly chargeable date."
            rows={data.pauses}
            columns={[
              'effective_from',
              'effective_until',
              'status',
              'reason',
              'resumed_at',
            ]}
          />
        </TabsContent>
        <TabsContent value="adjustments" className="grid gap-5 xl:grid-cols-2">
          <DataCard
            title="Waivers & balance adjustments"
            description="Cash credits occur once; day waivers follow dated obligations."
            rows={data.adjustments}
            columns={[
              'effective_date',
              'adjustment_type',
              'amount',
              'starts_on',
              'ends_on',
              'status',
              'reason',
            ]}
          />
          <DataCard
            title="Penalties"
            description="Penalties are receivables, never income until paid."
            rows={data.penalties}
            columns={[
              'effective_date',
              'penalty_type',
              'amount',
              'waived_amount',
              'status',
              'reason',
            ]}
          />
        </TabsContent>
        <TabsContent value="operations" className="grid gap-5 xl:grid-cols-3">
          <DataCard
            title="Assignments"
            description="Vehicle and operational allocation history."
            rows={data.assignments}
            columns={[
              'assignment_type',
              'status',
              'assigned_from',
              'assigned_until',
              'release_gate_status',
            ]}
          />
          <DataCard
            title="Documents"
            description="Driver and contract evidence."
            rows={data.documents}
            columns={[
              'title',
              'document_number',
              'verification_status',
              'issue_date',
              'expiry_date',
            ]}
          />
          <DataCard
            title="Incidents"
            description="Incidents linked to this driver."
            rows={data.incidents}
            columns={[
              'incident_code',
              'incident_type',
              'incident_date',
              'severity',
              'status',
            ]}
          />
        </TabsContent>
        <TabsContent value="timeline">
          <DataCard
            title="Immutable audit timeline"
            description="Rate, pause, adjustment, penalty and reversal events."
            rows={data.timeline}
            columns={[
              'effective_date',
              'entry_type',
              'description',
              'amount',
              'status',
              'reason',
            ]}
          />
        </TabsContent>
      </Tabs>

      <Sheet
        open={Boolean(action)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setAction(null);
            setPreview(null);
            setPayload(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {action ? actionTitles[action] : 'Remittance action'}
            </SheetTitle>
            <SheetDescription>
              Choose the true effective date. You will see the estimated ledger
              impact before anything is committed.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {!preview ? (
              <form
                id="remittance-action"
                onSubmit={submitPreview}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="effective_from">Effective date</Label>
                    <Input
                      id="effective_from"
                      name="effective_from"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  {action && ['pause', 'days_waiver'].includes(action) && (
                    <div className="space-y-2">
                      <Label htmlFor="effective_until">
                        End date (optional for pause)
                      </Label>
                      <Input
                        id="effective_until"
                        name="effective_until"
                        type="date"
                        required={action === 'days_waiver'}
                      />
                    </div>
                  )}
                </div>
                {action && moneyActions.includes(action) && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (UGX)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                )}
                {action === 'rate_change' && (
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      id="frequency"
                      name="frequency"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      defaultValue={String(contract.remittance_frequency || contract.contract_type || 'daily')}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
                {action === 'penalty' && (
                  <div className="space-y-2">
                    <Label htmlFor="penalty_type">Penalty type</Label>
                    <Input
                      id="penalty_type"
                      name="penalty_type"
                      placeholder="Traffic fine, negligence, damage…"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    name="reason"
                    placeholder="Required audit reason"
                    required
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Evidence, incident context, approval notes…"
                  />
                </div>
                {action === 'manual_credit' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => open('manual_debit')}
                  >
                    Switch to debit balance
                  </Button>
                )}
                {action === 'cash_waiver' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => open('days_waiver')}
                  >
                    Switch to date-range waiver
                  </Button>
                )}
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.08] p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Review before committing</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {preview.warning ||
                          `${preview.affected_calendar_rows} calendar rows are affected.`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SemanticMetric
                    label="Current owed"
                    value={preview.current_owed}
                  />
                  <SemanticMetric
                    label="Estimated change"
                    value={preview.estimated_change}
                    tone={preview.estimated_change > 0 ? 'danger' : 'accent'}
                  />
                  <SemanticMetric
                    label="Estimated owed"
                    value={preview.estimated_owed}
                  />
                </div>
                <div className="rounded-lg border p-4 text-sm">
                  {Object.entries(preview.details).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b py-2 last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {formatLabel(key)}
                      </span>
                      <span className="text-right font-medium">
                        {String(value ?? 'Open-ended')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SheetBody>
          <SheetFooter>
            {preview ? (
              <>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Back
                </Button>
                <Button
                  disabled={commitAction.isPending}
                  onClick={() => payload && commitAction.mutate(payload)}
                >
                  {commitAction.isPending ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <Scale />
                  )}
                  Confirm & recalculate
                </Button>
              </>
            ) : (
              <Button
                form="remittance-action"
                type="submit"
                disabled={previewAction.isPending}
              >
                {previewAction.isPending ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <Calculator />
                )}
                Preview impact
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DataCard({
  title,
  description,
  rows,
  columns,
}: {
  title: string;
  description: string;
  rows: Row[];
  columns: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{formatLabel(column)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, index) => (
                <TableRow key={String(row.id ?? index)}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {column.match(/amount|rate/) ? (
                        money(row[column])
                      ) : (
                        <ValueDisplay value={row[column]} field={column} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No records yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function baseBalance(day: Row) {
  if (['scheduled', 'not_due'].includes(String(day.status || ''))) return 0;
  const expected = Number(day.expected_amount || 0);
  const paid = Math.max(
    Number(day.actual_paid || 0) - Number(day.welfare_paid || 0),
    0,
  );
  const waived = Math.min(
    expected,
    Number(day.waived_amount || 0) + Number(day.reduced_amount || 0),
  );
  return Math.max(expected - paid - waived, 0);
}

function calendarPeriod(day: Row) {
  const starts = day.period_starts_on || day.remittance_date;
  const ends = day.period_ends_on || starts;
  if (!starts) return '—';
  if (String(starts).slice(0, 10) === String(ends).slice(0, 10)) return formatDate(String(starts));

  return `${formatDate(String(starts))} – ${formatDate(String(ends))}`;
}
