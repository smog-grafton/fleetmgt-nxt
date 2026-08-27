export type RouteDefinition =
  | { kind: 'dashboard'; title: string; dashboard: string; description: string }
  | { kind: 'resource'; title: string; resource: string; description?: string; id?: number }
  | { kind: 'remittance-dashboard'; title: string }
  | { kind: 'remittance-drivers'; title: string }
  | { kind: 'remittance-profile'; title: string; id: number }
  | { kind: 'remittance-payment'; title: string }
  | { kind: 'academy-register'; title: string }
  | { kind: 'academy-test'; title: string }
  | { kind: 'settings'; title: string }
  | { kind: 'admin-users'; title: string }
  | { kind: 'admin-roles'; title: string }
  | { kind: 'health'; title: string }
  | { kind: 'catalog'; title: string }
  | { kind: 'not-found'; title: string };

const dashboards: Record<string, [string, string]> = {
  dashboard: ['Operations', 'operations'],
  'ops/operations': ['Operations', 'operations'],
  'ops/dispatch': ['Dispatch', 'dispatch'],
  'ops/finance': ['Finance', 'finance'],
  'ops/compliance': ['Compliance', 'compliance'],
  'ops/hr': ['HR & Payroll', 'hr'],
  'ops/boda': ['Boda Operations', 'boda'],
  'ops/academy': ['Driver Academy', 'academy'],
  'ops/assets': ['Fleet Assets', 'assets'],
  'ops/partnerships': ['Partnerships', 'partnerships'],
  'ops/intelligence': ['Alerts & Intelligence', 'intelligence'],
};

const resources: Record<string, string> = {
  documents: 'documents', people: 'people', assignments: 'assignments',
  'assignment-checklists': 'assignment-checklists', 'assignment-approvals': 'assignment-approvals',
  'ops-bookings': 'ops-bookings', dispatches: 'dispatches', departments: 'departments', employees: 'employees',
  'employee-contracts': 'employee-contracts', 'payroll-periods': 'payroll-periods', payslips: 'payslips',
  'employee-allowances': 'employee-allowances', 'employee-deductions': 'employee-deductions',
  'employee-salary-advances': 'employee-salary-advances', 'employee-attendances': 'employee-attendances',
  'leave-requests': 'leave-requests', drivers: 'drivers', 'facilitated-visits': 'facilitated-visits',
  'vehicle-issuances': 'vehicle-issuances', 'academy-courses': 'academy-courses', 'car-contracts': 'car-contracts',
  'boda-contracts': 'boda-contracts', 'driver-welfare-funds': 'driver-welfare-funds',
  'remittance-adjustments': 'remittance-adjustments', 'remittance-payment-batches': 'remittance-payment-batches',
  'fleet-assets': 'fleet-assets', 'remittance-calendars': 'remittance-calendars',
  'remittance-payments': 'remittance-payments', 'fuel-prices': 'fuel-prices', 'rate-cards': 'rate-cards',
  partners: 'partners', equipment: 'equipment', inspections: 'inspections', incidents: 'incidents', alerts: 'alerts',
  'fare-estimates': 'fare-estimates', 'settlement-ledgers': 'settlement-ledgers', 'finance-ledger': 'finance-ledger',
  invoices: 'invoices', payments: 'payments', 'income-records': 'income-records', 'expense-records': 'expense-records',
  'tax-rules': 'tax-rules', contracts: 'contracts',
};

export function resolveRoute(segments: string[]): RouteDefinition {
  const path = segments.join('/');
  if (dashboards[path]) {
    const [title, dashboard] = dashboards[path];
    return { kind: 'dashboard', title, dashboard, description: `${title} command center with live Operations V2 data.` };
  }
  if (path === 'ops/remittance') return { kind: 'remittance-dashboard', title: 'Remittance Dashboard' };
  if (path === 'ops/remittance/assigned') return { kind: 'remittance-drivers', title: 'Assigned Drivers & Riders' };
  if (path === 'ops/remittance/payments/create') return { kind: 'remittance-payment', title: 'Record Remittance Payment' };
  const profile = path.match(/^ops\/remittance\/drivers\/(\d+)$/);
  if (profile) return { kind: 'remittance-profile', title: 'Driver Remittance Profile', id: Number(profile[1]) };
  if (path === 'ops/academy/register') return { kind: 'academy-register', title: 'Register Driver' };
  if (path === 'ops/academy/tests/create') return { kind: 'academy-test', title: 'Driver Testing Checklist' };
  if (path === 'settings/operations') return { kind: 'settings', title: 'Operations Settings' };
  if (path === 'admin/users') return { kind: 'admin-users', title: 'Admin Users' };
  if (path === 'admin/roles') return { kind: 'admin-roles', title: 'Access Roles' };
  if (path === 'system/health') return { kind: 'health', title: 'API Health' };
  if (path === 'system/catalog') return { kind: 'catalog', title: 'Operations Data Catalog' };
  if (segments[0] === 'ops' && segments[1] === 'manage' && resources[segments[2]]) {
    const resource = resources[segments[2]];
    return { kind: 'resource', title: resource, resource, id: segments[3] && /^\d+$/.test(segments[3]) ? Number(segments[3]) : undefined, description: 'Search, filter, review and manage live Operations V2 records.' };
  }
  return { kind: 'not-found', title: 'Page not found' };
}
