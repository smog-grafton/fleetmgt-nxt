import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/helpers';

const statusWords = new Set([
  'active',
  'approved',
  'paid',
  'posted',
  'completed',
  'verified',
  'available',
  'passed',
  'released',
  'success',
  'not_due',
]);
const warningWords = new Set([
  'pending',
  'processing',
  'in_progress',
  'part_paid',
  'partial',
  'conditional',
  'scheduled',
  'renewal_due',
  'paused',
  'deferred',
]);
const dangerWords = new Set([
  'inactive',
  'rejected',
  'failed',
  'blocked',
  'overdue',
  'void',
  'cancelled',
  'expired',
  'critical',
  'danger',
  'reversed',
]);

export function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ValueDisplay({
  value,
  field,
  lookup,
}: {
  value: unknown;
  field?: string;
  lookup?: Record<string, string>;
}) {
  if (value === null || value === undefined || value === '')
    return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean')
    return (
      <Badge variant={value ? 'success' : 'secondary'} appearance="light">
        {value ? 'Yes' : 'No'}
      </Badge>
    );
  if (typeof value === 'object')
    return (
      <span className="line-clamp-2 max-w-72 text-xs text-muted-foreground">
        {JSON.stringify(value)}
      </span>
    );
  const rawText = String(value);
  const text = lookup?.[rawText] ?? rawText;
  const normalized = text.toLowerCase();
  if (
    field?.match(/status|state|stage|result|severity|direction|type$/) ||
    statusWords.has(normalized) ||
    warningWords.has(normalized) ||
    dangerWords.has(normalized)
  ) {
    const variant = statusWords.has(normalized)
      ? 'success'
      : dangerWords.has(normalized)
        ? 'destructive'
        : warningWords.has(normalized)
          ? 'warning'
          : 'secondary';
    return (
      <Badge variant={variant} appearance="light">
        {formatLabel(text)}
      </Badge>
    );
  }
  if (field?.match(/(^|_)(date|on)$/)) {
    return <span className="whitespace-nowrap">{formatDate(rawText)}</span>;
  }
  if (field?.match(/(^|_)(at|time)$/)) {
    return <span className="whitespace-nowrap">{formatDateTime(rawText)}</span>;
  }
  return (
    <span className="line-clamp-2 max-w-72" title={text}>
      {text}
    </span>
  );
}
