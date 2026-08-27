import { Badge } from '@/components/ui/badge';

const statusWords = new Set(['active', 'approved', 'paid', 'posted', 'completed', 'verified', 'available', 'passed', 'released', 'success']);
const warningWords = new Set(['pending', 'processing', 'in_progress', 'part_paid', 'conditional', 'scheduled', 'renewal_due']);
const dangerWords = new Set(['inactive', 'rejected', 'failed', 'blocked', 'overdue', 'void', 'cancelled', 'expired', 'critical', 'danger']);

export function formatLabel(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function ValueDisplay({ value, field }: { value: unknown; field?: string }) {
  if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean') return <Badge variant={value ? 'success' : 'secondary'} appearance="light">{value ? 'Yes' : 'No'}</Badge>;
  if (typeof value === 'object') return <span className="line-clamp-2 max-w-72 text-xs text-muted-foreground">{JSON.stringify(value)}</span>;
  const text = String(value);
  const normalized = text.toLowerCase();
  if (field?.match(/status|state|stage|result|severity|direction|type$/) || statusWords.has(normalized) || warningWords.has(normalized) || dangerWords.has(normalized)) {
    const variant = statusWords.has(normalized) ? 'success' : dangerWords.has(normalized) ? 'destructive' : warningWords.has(normalized) ? 'warning' : 'secondary';
    return <Badge variant={variant} appearance="light">{formatLabel(text)}</Badge>;
  }
  return <span className="line-clamp-2 max-w-72" title={text}>{text}</span>;
}
