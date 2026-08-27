import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() { return <div className="mx-auto max-w-[1600px] space-y-5"><Skeleton className="h-20" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-28" key={index} />)}</div><Skeleton className="h-[420px]" /></div>; }
