import { ReactNode } from 'react';
import Link from 'next/link';
import { BadgeCheck, Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-muted/30 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,.22),transparent_36%),radial-gradient(circle_at_80%_75%,rgba(59,130,246,.18),transparent_38%)]" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-green-500 text-lg font-black text-zinc-950">Z</span>
          <div><p className="font-semibold">Zuri Management</p><p className="text-xs text-zinc-400">Operations V2</p></div>
        </div>
        <div className="relative max-w-xl space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"><Sparkles className="size-3.5 text-green-400" />One operational source of truth</div>
          <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">Run people, fleet, remittance and finance from one command centre.</h1>
          <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4"><Building2 className="mb-3 size-5 text-blue-400" />Company logistics</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4"><BadgeCheck className="mb-3 size-5 text-green-400" />Controlled workflows</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-3 size-5 text-amber-400" />Auditable access</div>
          </div>
        </div>
        <p className="relative text-xs text-zinc-500">© {new Date().getFullYear()} Zuri Ride. Authorized staff only.</p>
      </section>
      <section className="flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-8 flex items-center justify-center gap-2 lg:hidden"><span className="grid size-9 place-items-center rounded-lg bg-green-500 font-black text-zinc-950">Z</span><span className="font-semibold">Zuri Management</span></Link>
          {children}
        </div>
      </section>
    </main>
  );
}
