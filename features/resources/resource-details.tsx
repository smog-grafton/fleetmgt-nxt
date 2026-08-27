import { Download, ExternalLink } from 'lucide-react';
import { ResourceRecord, ResourceSchema } from '@/types/api';
import { Button } from '@/components/ui/button';
import { SheetBody } from '@/components/ui/sheet';
import { ValueDisplay } from './value-display';

export function ResourceDetails({ schema, record }: { schema: ResourceSchema; record: ResourceRecord }) {
  return <SheetBody className="space-y-5 overflow-y-auto px-6"><div className="grid gap-3 sm:grid-cols-2">{Object.entries(record).map(([field, value]) => <div key={field} className="rounded-lg border p-3"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{schema.fields[field]?.label || schema.columns[field] || field.replaceAll('_', ' ')}</p><ValueDisplay value={value} field={field} /></div>)}</div>{schema.resource === 'documents' && <Button asChild className="w-full"><a href={`/api/backend/documents/${record.id}/content`} target="_blank" rel="noreferrer"><Download />View or download document</a></Button>}{schema.resource === 'invoices' && <Button asChild variant="outline" className="w-full"><a href={`/api/backend/invoices/${record.id}/print-data`} target="_blank" rel="noreferrer"><ExternalLink />Open invoice data</a></Button>}</SheetBody>;
}
