'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FileUp, LoaderCircle, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api/client';
import { ResourceRecord, ResourceSchema } from '@/types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetBody, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { FilePreview } from '@/components/zuri/file-preview';

type Primitive = string | boolean;
function inputValue(value: unknown, type?: string) {
  if (value === null || value === undefined) return '';
  if (type === 'boolean') return value === true || value === 1 || value === '1' || value === 'true';
  if (type === 'datetime-local') return String(value).replace(' ', 'T').slice(0, 16);
  if (type === 'date') return String(value).slice(0, 10);
  return typeof value === 'boolean' ? value : String(value);
}

export function ResourceForm({ schema, record, defaults = {}, onSaved, onCancel }: { schema: ResourceSchema; record?: ResourceRecord | null; defaults?: Record<string, string>; onSaved: () => void; onCancel: () => void }) {
  const queryClient = useQueryClient();
  const initial = useMemo(() => Object.fromEntries(Object.entries(schema.fields).map(([name, field]) => [name, inputValue(record?.[name] ?? defaults[name], field.type)])), [schema, record, defaults]);
  const [values, setValues] = useState<Record<string, Primitive>>(initial);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  useEffect(() => setValues(initial), [initial]);
  const mutation = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      Object.entries(schema.fields).forEach(([name, field]) => {
        if (field.readonly) return;
        if (field.type === 'file') { if (files[name]) body.append(name, files[name] as File); return; }
        const value = values[name];
        body.append(name, field.type === 'boolean' ? (value ? '1' : '0') : String(value ?? ''));
      });
      const method = 'POST';
      let path = `resources/${schema.resource}`;
      if (record) { path += `/${record.id}`; body.append('_method', 'PATCH'); }
      return apiRequest<ResourceRecord>(path, { method, body });
    },
    onSuccess: (result) => { toast.success(result.message); void queryClient.invalidateQueries({ queryKey: ['resource-list', schema.resource] }); onSaved(); },
  });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
    <SheetBody className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6">
      {mutation.isError && <Alert variant="destructive"><AlertDescription>{mutation.error.message}</AlertDescription></Alert>}
      {Object.entries(schema.fields).map(([name, field]) => {
        const required = typeof field.rules === 'string' ? field.rules.split('|').includes('required') : field.rules?.includes('required');
        const value = values[name];
        return <div className="space-y-2" key={name}><Label htmlFor={`field-${name}`}>{field.label}{required && <span className="ms-1 text-destructive">*</span>}</Label>
          {field.type === 'textarea' ? <Textarea id={`field-${name}`} value={String(value ?? '')} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} rows={4} required={required} readOnly={field.readonly} />
          : field.type === 'select' ? <Select value={String(value ?? '') || '__empty__'} onValueChange={(next) => setValues((current) => ({ ...current, [name]: next === '__empty__' ? '' : next }))} disabled={field.readonly}><SelectTrigger id={`field-${name}`}><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger><SelectContent>{Object.entries(schema.lookups[name] || {}).map(([option, label]) => <SelectItem key={`${name}-${option || 'empty'}`} value={option || '__empty__'}>{label}</SelectItem>)}</SelectContent></Select>
          : field.type === 'boolean' ? <label className="flex min-h-10 items-center gap-3 rounded-md border px-3"><Checkbox id={`field-${name}`} checked={Boolean(value)} onCheckedChange={(checked) => setValues((current) => ({ ...current, [name]: checked === true }))} disabled={field.readonly} /><span className="text-sm text-muted-foreground">Enabled</span></label>
          : field.type === 'file' ? <><label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-4 transition-colors hover:bg-muted/50"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileUp /></span><span className="min-w-0"><span className="block truncate text-sm font-medium">{files[name]?.name || 'Choose a file'}</span><span className="block text-xs text-muted-foreground">PDF, image or document up to the backend limit</span></span><Input id={`field-${name}`} type="file" accept="image/*,application/pdf,.doc,.docx" className="sr-only" onChange={(event) => setFiles((current) => ({ ...current, [name]: event.target.files?.[0] || null }))} /></label><FilePreview file={files[name] || null} label={field.label} /></>
          : <Input id={`field-${name}`} type={field.type || 'text'} value={String(value ?? '')} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} required={required} readOnly={field.readonly} step={field.type === 'number' ? 'any' : undefined} />}
          {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
        </div>;
      })}
    </SheetBody>
    <SheetFooter className="border-t px-6 py-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="animate-spin" /> : <Save />}{record ? `Save ${schema.singular}` : `Create ${schema.singular}`}</Button></SheetFooter>
  </form>;
}
