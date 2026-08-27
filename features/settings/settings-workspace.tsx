'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, RotateCcw, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingDefinition { key: string; label: string; group: string; type: 'boolean' | 'select' | 'string' | 'integer' | 'decimal' | 'timezone' | 'secret'; value: string; default: string; allowed_values?: string[]; is_configured?: boolean }
const groupDescriptions: Record<string, string> = { navigation: 'Workspace behavior and guidance', finance: 'Dimensional accounting and document rules', pricing: 'Route, multiplier, cost and margin defaults', remittance: 'Calendar, allocation, credit, welfare and penalty rules', alerts: 'Expiry and operational warning windows', system: 'Timezone and protected quick-entry credentials' };
function selectValues(setting: SettingDefinition) {
  if (setting.allowed_values?.length) return setting.allowed_values;
  const known: Record<string, string[]> = { ops_v2_sidebar_mode: ['focused', 'expanded'], ops_v2_route_provider: ['auto', 'manual', 'coordinate_fallback'], ops_v2_remittance_default_allocation_method: ['oldest_first'], ops_v2_remittance_default_contract_status: ['draft', 'active', 'suspended', 'completed', 'cancelled'], ops_v2_remittance_default_frequency: ['daily', 'weekly', 'monthly', 'custom'] };
  return known[setting.key] || [];
}
export function SettingsWorkspace() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['operations-settings'], queryFn: () => apiGet<SettingDefinition[]>('settings/operations') });
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => { if (query.data) setValues(Object.fromEntries(query.data.data.map((setting) => [setting.key, setting.type === 'secret' ? '' : setting.value]))); }, [query.data]);
  const grouped = useMemo(() => Object.entries(Object.groupBy(query.data?.data || [], (setting) => setting.group)), [query.data]);
  const mutation = useMutation({ mutationFn: () => { const settings = Object.fromEntries(Object.entries(values).filter(([key, value]) => { const definition = query.data?.data.find((setting) => setting.key === key); return definition?.type !== 'secret' || value !== ''; })); return apiPatch('settings/operations', { settings }); }, onSuccess: (result) => { toast.success(result.message); void client.invalidateQueries({ queryKey: ['operations-settings'] }); } });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <form onSubmit={submit} className="mx-auto max-w-6xl space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge variant="warning" appearance="light">Restricted controls</Badge><h1 className="mt-2 text-2xl font-semibold">Operations Settings</h1><p className="mt-1 text-sm text-muted-foreground">V2-only business defaults. Changes affect pricing, remittance and automated finance behavior.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => query.data && setValues(Object.fromEntries(query.data.data.map((setting) => [setting.key, setting.type === 'secret' ? '' : setting.value])))}><RotateCcw />Discard changes</Button><Button disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="animate-spin" /> : <Save />}Save settings</Button></div></div>
    <Alert><ShieldAlert /><AlertDescription>Quick-entry tokens are never displayed. Leave a secret blank to keep the configured value; enter a new value only to rotate it.</AlertDescription></Alert>
    {query.isError && <Alert variant="destructive"><AlertDescription>{query.error.message}</AlertDescription></Alert>}
    {grouped.map(([group, settings]) => settings && <Card key={group}><CardHeader><div><CardTitle className="capitalize">{group}</CardTitle><CardDescription>{groupDescriptions[group] || 'Operations V2 configuration'}</CardDescription></div></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">{settings.map((setting) => <div className="space-y-2" key={setting.key}><Label htmlFor={setting.key}>{setting.label}</Label>{setting.type === 'boolean' ? <label className="flex min-h-10 items-center justify-between rounded-lg border px-3"><span className="text-sm text-muted-foreground">{values[setting.key] === '1' ? 'Enabled' : 'Disabled'}</span><Checkbox id={setting.key} checked={values[setting.key] === '1'} onCheckedChange={(checked) => setValues((current) => ({ ...current, [setting.key]: checked ? '1' : '0' }))} /></label> : setting.type === 'select' ? <Select value={values[setting.key] || setting.default} onValueChange={(value) => setValues((current) => ({ ...current, [setting.key]: value }))}><SelectTrigger id={setting.key}><SelectValue /></SelectTrigger><SelectContent>{selectValues(setting).map((value) => <SelectItem key={value} value={value}>{value.replaceAll('_', ' ')}</SelectItem>)}</SelectContent></Select> : <Input id={setting.key} type={setting.type === 'secret' ? 'password' : ['integer', 'decimal'].includes(setting.type) ? 'number' : 'text'} step={setting.type === 'decimal' ? 'any' : undefined} placeholder={setting.type === 'secret' && setting.is_configured ? 'Configured — enter to rotate' : setting.default} value={values[setting.key] || ''} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} />}<p className="text-[11px] text-muted-foreground">Key: {setting.key}</p></div>)}</CardContent></Card>)}
  </form>;
}
