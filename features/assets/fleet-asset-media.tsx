'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, FileText, ImageIcon, LoaderCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { apiGet, apiRequest } from '@/lib/api/client';
import { formatDate } from '@/lib/helpers';
import { FilePreview } from '@/components/zuri/file-preview';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Media = {
  id: number;
  title?: string;
  file_name?: string;
  document_type?: string;
  document_type_code?: string;
  mime_type?: string;
  preview_kind?: 'image' | 'pdf' | 'file';
  uploaded_at?: string;
  uploaded_by?: string | number;
  notes?: string;
  is_primary?: boolean;
};
type AssetMediaPayload = {
  main_photo?: Media;
  photos: Media[];
  documents: Media[];
  document_types: Record<string, string>;
};

const contentUrl = (id: number) => `/api/backend/documents/${id}/content`;

export function FleetAssetMedia({ assetId }: { assetId: number }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('vehicle_photo');
  const [primary, setPrimary] = useState(false);
  const query = useQuery({
    queryKey: ['fleet-asset-media', assetId],
    queryFn: () => apiGet<AssetMediaPayload>(`fleet-assets/${assetId}`),
  });
  const upload = useMutation({
    mutationFn: (body: FormData) => apiRequest<Media>(`fleet-assets/${assetId}/media`, { method: 'POST', body }),
    onSuccess: (result) => {
      toast.success(result.message);
      setFile(null);
      setPrimary(false);
      void queryClient.invalidateQueries({ queryKey: ['fleet-asset-media', assetId] });
    },
    onError: (error) => toast.error(error.message),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return toast.error('Choose a photo or document first.');
    const body = new FormData(event.currentTarget);
    body.set('file', file);
    body.set('document_type_code', type);
    body.set('is_primary', primary ? '1' : '0');
    upload.mutate(body);
  }

  const data = query.data?.data;
  return (
    <div className="space-y-5 border-t pt-5">
      <div>
        <h3 className="font-semibold">Photos & documents</h3>
        <p className="text-sm text-muted-foreground">Vehicle photos, logbooks, insurance, licenses, inspections, tracker files, service records and purchase evidence.</p>
      </div>
      {data?.photos.length ? (
        <div className="grid grid-cols-2 gap-3">
          {data.photos.map((photo) => (
            <a key={photo.id} href={contentUrl(photo.id)} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border bg-muted/20">
              {/* Authenticated local media is served through the backend proxy. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={contentUrl(photo.id)} alt={photo.title || photo.file_name || 'Vehicle photo'} className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]" />
              <div className="flex items-center gap-2 p-2 text-xs"><ImageIcon className="size-3.5" /><span className="truncate">{photo.file_name || photo.title}</span>{photo.is_primary && <span className="ml-auto text-primary">Main</span>}</div>
            </a>
          ))}
        </div>
      ) : <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">No vehicle photos uploaded yet.</div>}
      {data?.documents.length ? (
        <div className="space-y-2">
          {data.documents.map((document) => (
            <div key={document.id} className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="size-5 text-primary" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{document.title || document.file_name}</p><p className="truncate text-xs text-muted-foreground">{document.document_type} · {document.file_name}</p><p className="truncate text-xs text-muted-foreground">{document.uploaded_at ? formatDate(document.uploaded_at) : 'Date unavailable'}{document.uploaded_by ? ` · ${document.uploaded_by}` : ''}{document.notes ? ` · ${document.notes}` : ''}</p></div>
              <Button size="icon" variant="ghost" asChild><a href={contentUrl(document.id)} target="_blank" rel="noreferrer" aria-label="Preview document"><ExternalLink /></a></Button>
              <Button size="icon" variant="ghost" asChild><a href={`${contentUrl(document.id)}?download=1`} aria-label="Download document"><Download /></a></Button>
            </div>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-muted/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2"><Label>Media / document type</Label><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(data?.document_types || { vehicle_photo: 'Vehicle Photo' }).map(([code, label]) => <SelectItem value={code} key={code}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>File</Label><label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-sm"><Upload className="size-4" /><span className="truncate">{file?.name || 'Choose file'}</span><Input key={file ? `${file.name}-${file.size}` : 'empty'} className="sr-only" type="file" accept="image/*,application/pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label></div>
          <div className="space-y-2"><Label>Title</Label><Input name="title" placeholder="e.g. Front view or 2026 logbook" /></div>
          <div className="space-y-2"><Label>Document number</Label><Input name="document_number" /></div>
          <div className="space-y-2"><Label>Issue date</Label><Input name="issue_date" type="date" /></div>
          <div className="space-y-2"><Label>Expiry date</Label><Input name="expiry_date" type="date" /></div>
        </div>
        <div className="space-y-2"><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
        {type === 'vehicle_photo' && <label className="flex items-center gap-2 text-sm"><Checkbox checked={primary} onCheckedChange={(checked) => setPrimary(checked === true)} />Use as main vehicle photo</label>}
        <FilePreview file={file} label={type === 'vehicle_photo' ? 'Vehicle photo' : data?.document_types[type]} />
        <Button type="submit" disabled={!file || upload.isPending}>{upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}Upload to asset</Button>
      </form>
    </div>
  );
}
