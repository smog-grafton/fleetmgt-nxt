'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingDefinition {
  key: string;
  label: string;
  group: string;
  type:
    | 'boolean'
    | 'select'
    | 'string'
    | 'integer'
    | 'decimal'
    | 'timezone'
    | 'secret';
  value: string;
  current_value?: string | null;
  default: string;
  allowed_values?: string[];
  is_configured?: boolean;
}

const groupDescriptions: Record<string, string> = {
  navigation: 'Workspace behavior and guidance',
  finance: 'Dimensional accounting and document rules',
  pricing: 'Route, multiplier, cost and margin defaults',
  remittance: 'Calendar, allocation, credit, welfare and penalty rules',
  alerts: 'Expiry and operational warning windows',
  system: 'Timezone and protected quick-entry credentials',
};

const quickToolPaths: Record<string, string> = {
  ops_v2_quick_attendance_token: '/quick-attendance',
  ops_v2_quick_finance_token: '/quick-finance',
  ops_v2_quick_income_token: '/quick-income',
  ops_v2_quick_expense_token: '/quick-expense',
  ops_v2_quick_remittance_token: '/quick-remittance',
};

function selectValues(setting: SettingDefinition) {
  if (setting.allowed_values?.length) return setting.allowed_values;
  const known: Record<string, string[]> = {
    ops_v2_sidebar_mode: ['focused', 'expanded'],
    ops_v2_route_provider: ['auto', 'manual', 'coordinate_fallback'],
    ops_v2_remittance_default_allocation_method: ['oldest_first'],
    ops_v2_remittance_default_contract_status: [
      'draft',
      'active',
      'suspended',
      'completed',
      'cancelled',
    ],
    ops_v2_remittance_default_frequency: [
      'daily',
      'weekly',
      'monthly',
      'custom',
    ],
  };
  return known[setting.key] || [];
}

function QuickTokenControl({
  setting,
  rotationValue,
  origin,
  onChange,
}: {
  setting: SettingDefinition;
  rotationValue: string;
  origin: string;
  onChange: (value: string) => void;
}) {
  const [copied, setCopied] = useState<'token' | 'link' | null>(null);
  const token = setting.current_value || '';
  const path = token ? `${quickToolPaths[setting.key]}/${encodeURIComponent(token)}` : '';
  const link = path ? `${origin}${path}` : '';

  async function copy(value: string, kind: 'token' | 'link') {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    toast.success(kind === 'token' ? 'Token copied' : 'Quick link copied');
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={setting.key}>{setting.label}</Label>
        <Badge variant={token ? 'success' : 'secondary'} appearance="light">
          {token ? 'Active' : 'Not configured'}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          Current token
        </span>
        <div className="flex gap-2">
          <code className="flex min-h-10 min-w-0 flex-1 items-center overflow-x-auto rounded-lg border bg-background px-3 text-sm font-semibold">
            {token || 'No token configured'}
          </code>
          <Button
            type="button"
            mode="icon"
            variant="outline"
            disabled={!token}
            aria-label={`Copy ${setting.label}`}
            onClick={() => void copy(token, 'token')}
          >
            {copied === 'token' ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          Public quick link
        </span>
        <div className="flex gap-2">
          <code className="flex min-h-10 min-w-0 flex-1 items-center overflow-x-auto rounded-lg border bg-background px-3 text-xs">
            {link || 'Available after a token is configured'}
          </code>
          <Button
            type="button"
            mode="icon"
            variant="outline"
            disabled={!link}
            aria-label={`Copy ${setting.label} link`}
            onClick={() => void copy(link, 'link')}
          >
            {copied === 'link' ? <Check /> : <Copy />}
          </Button>
          <Button
            type="button"
            mode="icon"
            variant="outline"
            disabled={!link}
            aria-label={`Open ${setting.label} link`}
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={setting.key} className="text-xs">
          Rotate token
        </Label>
        <Input
          id={setting.key}
          type="password"
          autoComplete="new-password"
          placeholder="Enter a new token only when rotating"
          value={rotationValue}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">Key: {setting.key}</p>
    </div>
  );
}

export function SettingsWorkspace() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['operations-settings'],
    queryFn: () => apiGet<SettingDefinition[]>('settings/operations'),
  });
  const [values, setValues] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (query.data) {
      setValues(
        Object.fromEntries(
          query.data.data.map((setting) => [
            setting.key,
            setting.type === 'secret' ? '' : setting.value,
          ]),
        ),
      );
    }
  }, [query.data]);

  const grouped = useMemo(
    () =>
      Object.entries(
        Object.groupBy(query.data?.data || [], (setting) => setting.group),
      ),
    [query.data],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const settings = Object.fromEntries(
        Object.entries(values).filter(([key, value]) => {
          const definition = query.data?.data.find(
            (setting) => setting.key === key,
          );
          return definition?.type !== 'secret' || value !== '';
        }),
      );
      return apiPatch('settings/operations', { settings });
    },
    onSuccess: (result) => {
      toast.success(result.message);
      void client.invalidateQueries({ queryKey: ['operations-settings'] });
    },
  });

  function resetValues() {
    if (!query.data) return;
    setValues(
      Object.fromEntries(
        query.data.data.map((setting) => [
          setting.key,
          setting.type === 'secret' ? '' : setting.value,
        ]),
      ),
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="warning" appearance="light">
            Restricted controls
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">Operations Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            V2-only business defaults, scoped quick links, and protected
            credentials.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={resetValues}>
            <RotateCcw />
            Discard changes
          </Button>
          <Button disabled={mutation.isPending}>
            {mutation.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Save />
            )}
            Save settings
          </Button>
        </div>
      </div>

      <Alert>
        <ShieldAlert />
        <AlertDescription>
          Quick tokens and links are visible only to administrators with
          Operations Settings permission. Treat them like passwords; leave the
          rotation field blank to keep the current token.
        </AlertDescription>
      </Alert>

      {query.isError && (
        <Alert variant="destructive">
          <AlertDescription>{query.error.message}</AlertDescription>
        </Alert>
      )}

      {grouped.map(
        ([group, settings]) =>
          settings && (
            <Card key={group}>
              <CardHeader>
                <div>
                  <CardTitle className="capitalize">{group}</CardTitle>
                  <CardDescription>
                    {groupDescriptions[group] || 'Operations V2 configuration'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                {settings.map((setting) => {
                  if (setting.type === 'secret' && quickToolPaths[setting.key]) {
                    return (
                      <QuickTokenControl
                        key={setting.key}
                        setting={setting}
                        rotationValue={values[setting.key] || ''}
                        origin={origin}
                        onChange={(value) =>
                          setValues((current) => ({
                            ...current,
                            [setting.key]: value,
                          }))
                        }
                      />
                    );
                  }

                  return (
                    <div className="space-y-2" key={setting.key}>
                      <Label htmlFor={setting.key}>{setting.label}</Label>
                      {setting.type === 'boolean' ? (
                        <label className="flex min-h-10 items-center justify-between rounded-lg border px-3">
                          <span className="text-sm text-muted-foreground">
                            {values[setting.key] === '1'
                              ? 'Enabled'
                              : 'Disabled'}
                          </span>
                          <Checkbox
                            id={setting.key}
                            checked={values[setting.key] === '1'}
                            onCheckedChange={(checked) =>
                              setValues((current) => ({
                                ...current,
                                [setting.key]: checked ? '1' : '0',
                              }))
                            }
                          />
                        </label>
                      ) : setting.type === 'select' ? (
                        <Select
                          value={values[setting.key] || setting.default}
                          onValueChange={(value) =>
                            setValues((current) => ({
                              ...current,
                              [setting.key]: value,
                            }))
                          }
                        >
                          <SelectTrigger id={setting.key}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectValues(setting).map((value) => (
                              <SelectItem key={value} value={value}>
                                {value.replaceAll('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={setting.key}
                          type={
                            ['integer', 'decimal'].includes(setting.type)
                              ? 'number'
                              : 'text'
                          }
                          step={setting.type === 'decimal' ? 'any' : undefined}
                          placeholder={setting.default}
                          value={values[setting.key] || ''}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [setting.key]: event.target.value,
                            }))
                          }
                        />
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        Key: {setting.key}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ),
      )}
    </form>
  );
}
