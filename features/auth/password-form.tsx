'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordForm({ mode }: { mode: 'forgot' | 'reset' }) {
  const query = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === 'reset') values.token = query.get('token') || String(values.token || '');
    try {
      const response = await fetch(`/api/auth/${mode === 'forgot' ? 'forgot-password' : 'reset-password'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'The request failed.');
      setMessage(payload.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The request failed.'); }
    finally { setBusy(false); }
  }
  return (
    <Card className="shadow-lg shadow-black/5">
      <CardHeader className="block space-y-2 px-7 py-7"><CardTitle className="text-2xl">{mode === 'forgot' ? 'Reset your password' : 'Choose a new password'}</CardTitle><CardDescription>{mode === 'forgot' ? 'We will send instructions to your account email.' : 'Enter the email and a strong new password.'}</CardDescription></CardHeader>
      <CardContent className="space-y-5 p-7">
        <form onSubmit={submit} className="space-y-4">
          {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input variant="lg" id="email" name="email" type="email" defaultValue={query.get('email') || ''} required /></div>
          {mode === 'reset' && <><div className="space-y-2"><Label htmlFor="password">New password</Label><Input variant="lg" id="password" name="password" type="password" minLength={8} required /></div><div className="space-y-2"><Label htmlFor="password_confirmation">Confirm password</Label><Input variant="lg" id="password_confirmation" name="password_confirmation" type="password" minLength={8} required /></div></>}
          <Button size="lg" className="w-full" disabled={busy}>{busy && <LoaderCircle className="animate-spin" />}{mode === 'forgot' ? 'Send reset link' : 'Update password'}</Button>
        </form>
        <Button asChild variant="ghost" className="w-full"><Link href="/login"><ArrowLeft />Back to sign in</Link></Button>
      </CardContent>
    </Card>
  );
}
