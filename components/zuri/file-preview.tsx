'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

export function FilePreview({ file, label }: { file: File | null; label?: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (!file) return null;
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="mt-3 overflow-hidden rounded-lg border bg-muted/20">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-xs">
        <FileText className="size-4 text-primary" />
        <span className="font-medium">{label || file.name}</span>
        <span className="ml-auto text-muted-foreground">
          {(file.size / 1024).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB
        </span>
      </div>
      {isImage && url && (
        // Blob URLs are local previews and cannot be handled by next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`${label || file.name} preview`} className="max-h-72 w-full object-contain p-3" />
      )}
      {isPdf && url && <object data={url} type="application/pdf" className="h-72 w-full bg-white"><a href={url} target="_blank" rel="noreferrer">Open PDF preview</a></object>}
      {!isImage && !isPdf && <p className="p-3 text-xs text-muted-foreground">Preview is unavailable for this file type. The selected file name is shown above.</p>}
    </div>
  );
}
