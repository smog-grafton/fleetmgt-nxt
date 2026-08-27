import { Metadata } from 'next';
import { resolveRoute } from '@/config/route-registry';
import { RouteRenderer } from '@/components/zuri/route-renderer';

type PageProps = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const route = resolveRoute((await params).path);
  return { title: route.title };
}

export default async function OperationsPage({ params }: PageProps) {
  const route = resolveRoute((await params).path);
  return <RouteRenderer route={route} />;
}
