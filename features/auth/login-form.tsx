'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from './auth-provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get('email') || ''), String(data.get('password') || ''));
      toast.success('Welcome back.');
      const next = search.get('next');
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally { setBusy(false); }
  }

  return (
    <Card className="shadow-lg shadow-black/5">
      <CardHeader className="block space-y-2 px-7 py-7">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Use your Zuri operations administrator account.</CardDescription>
      </CardHeader>
      <CardContent className="p-7">
        <form className="space-y-5" onSubmit={submit}>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><InputWrapper variant="lg"><Mail /><Input id="email" name="email" type="email" autoComplete="email" placeholder="name@zuriride.com" required /></InputWrapper></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link className="text-xs font-medium text-primary hover:underline" href="/forgot-password">Forgot password?</Link></div>
            <InputWrapper variant="lg"><LockKeyhole /><Input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required /><button className="rounded p-1" type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff /> : <Eye />}</button></InputWrapper>
          </div>
          <Button className="w-full" size="lg" type="submit" disabled={busy}>{busy && <LoaderCircle className="animate-spin" />}Sign in securely</Button>
        </form>
      </CardContent>
    </Card>
  );
}
