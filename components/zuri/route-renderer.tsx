import Link from 'next/link';
import { ArrowLeft, MapPinned } from 'lucide-react';
import { RouteDefinition } from '@/config/route-registry';
import { AcademyRegistration } from '@/features/academy/academy-registration';
import { AcademyTest } from '@/features/academy/academy-test';
import { DashboardWorkspace } from '@/features/dashboard/dashboard-workspace';
import { RemittanceDashboard } from '@/features/remittance/remittance-dashboard';
import { RemittanceDrivers } from '@/features/remittance/remittance-drivers';
import { RemittancePaymentForm } from '@/features/remittance/payment-form';
import { RemittanceProfile } from '@/features/remittance/remittance-profile';
import { ResourceWorkspace } from '@/features/resources/resource-workspace';
import { AdminRolesWorkspace, AdminUsersWorkspace } from '@/features/settings/admin-access';
import { SettingsWorkspace } from '@/features/settings/settings-workspace';
import { CatalogWorkspace, HealthWorkspace } from '@/features/settings/system-workspaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function RouteRenderer({ route }: { route: RouteDefinition }) {
  switch (route.kind) {
    case 'dashboard': return <DashboardWorkspace title={route.title} description={route.description} dashboard={route.dashboard} />;
    case 'resource': return <ResourceWorkspace resource={route.resource} initialRecordId={route.id} />;
    case 'remittance-dashboard': return <RemittanceDashboard />;
    case 'remittance-drivers': return <RemittanceDrivers />;
    case 'remittance-profile': return <RemittanceProfile driverId={route.id} />;
    case 'remittance-payment': return <RemittancePaymentForm />;
    case 'academy-register': return <AcademyRegistration />;
    case 'academy-test': return <AcademyTest />;
    case 'settings': return <SettingsWorkspace />;
    case 'admin-users': return <AdminUsersWorkspace />;
    case 'admin-roles': return <AdminRolesWorkspace />;
    case 'health': return <HealthWorkspace />;
    case 'catalog': return <CatalogWorkspace />;
    default: return <div className="mx-auto max-w-xl py-20"><Card><CardContent className="py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-muted"><MapPinned /></span><h1 className="mt-5 text-xl font-semibold">Page not found</h1><p className="mt-2 text-sm text-muted-foreground">This path is not part of the Operations V2 management surface.</p><Button asChild className="mt-5"><Link href="/dashboard"><ArrowLeft />Back to dashboard</Link></Button></CardContent></Card></div>;
  }
}
