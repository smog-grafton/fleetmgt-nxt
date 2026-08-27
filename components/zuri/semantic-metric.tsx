import { formatLabel } from '@/features/resources/value-display';
import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  CreditCard,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'neutral';

const tones: Record<MetricTone, string> = {
  success:
    'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-300',
  warning:
    'border-amber-500/20 bg-amber-500/[0.09] text-amber-700 dark:bg-amber-500/[0.13] dark:text-amber-300',
  danger:
    'border-rose-500/20 bg-rose-500/[0.08] text-rose-700 dark:bg-rose-500/[0.12] dark:text-rose-300',
  info: 'border-sky-500/20 bg-sky-500/[0.08] text-sky-700 dark:bg-sky-500/[0.12] dark:text-sky-300',
  accent:
    'border-violet-500/20 bg-violet-500/[0.08] text-violet-700 dark:bg-violet-500/[0.12] dark:text-violet-300',
  neutral: 'border-border bg-muted/45 text-foreground',
};

export function metricTone(key: string, value = 0): MetricTone {
  const name = key.toLowerCase();
  if (name.match(/owed|overdue|arrears|penalt|failed|critical/))
    return value > 0 ? 'danger' : 'success';
  if (name.match(/paid|collected|income|success|available/)) return 'success';
  if (name.match(/expected|forecast|scheduled/)) return 'info';
  if (name.match(/waiv|credit|reduced|adjust/)) return 'accent';
  if (name.match(/welfare|pending|due/)) return 'warning';
  return 'neutral';
}

const icons = {
  success: TrendingUp,
  warning: AlertTriangle,
  danger: Scale,
  info: CircleDollarSign,
  accent: CreditCard,
  neutral: Banknote,
};

export function SemanticMetric({
  label,
  value,
  tone,
  prefix = '',
}: {
  label: string;
  value: unknown;
  tone?: MetricTone;
  prefix?: string;
}) {
  const numeric = Number(value || 0);
  const selected = tone || metricTone(label, numeric);
  const Icon =
    numeric === 0 && selected === 'danger' ? ShieldCheck : icons[selected];
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4',
        tones[selected],
      )}
    >
      <div className="absolute end-3 top-3 rounded-lg bg-background/55 p-2 opacity-75">
        <Icon className="size-4" />
      </div>
      <p className="pe-10 text-xs font-medium opacity-75">
        {formatLabel(label)}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        {prefix}
        {typeof value === 'number'
          ? value.toLocaleString()
          : String(value ?? '—')}
      </p>
    </div>
  );
}
