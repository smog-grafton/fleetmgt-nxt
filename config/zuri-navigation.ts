import {
  Activity, AlertTriangle, BadgeDollarSign, Banknote, Bike, BookOpenCheck, Boxes, BriefcaseBusiness,
  Building2, CalendarClock, CalendarDays, CarFront, ChartNoAxesCombined, CheckCheck, ClipboardCheck,
  ContactRound, CreditCard, FileCheck2, FileClock, FileStack, FileText, Fuel, Gauge, GraduationCap,
  HandCoins, Handshake, HeartHandshake, IdCard, Landmark, LayoutDashboard, ListChecks, LucideIcon,
  PackageCheck, PanelsTopLeft, ReceiptText, Route, Scale, Settings, ShieldCheck, Siren, SquareActivity,
  Tags, Users, UserRoundCheck, UserRoundCog, UserRoundPlus, WalletCards, Warehouse, Waypoints,
} from 'lucide-react';
import type { ApiUser } from '@/types/api';

export interface NavigationItem {
  title: string;
  path: string;
  icon: LucideIcon;
  description?: string;
}
export interface NavigationSection { title: string; items: NavigationItem[] }

export const navigation: NavigationSection[] = [
  { title: 'Command Center', items: [
    { title: 'Operations', path: '/dashboard', icon: LayoutDashboard, description: 'Daily operations overview' },
    { title: 'Dispatch', path: '/ops/dispatch', icon: Route, description: 'Availability and dispatch queue' },
    { title: 'Finance', path: '/ops/finance', icon: ChartNoAxesCombined, description: 'Income, expense and margin control' },
    { title: 'Compliance', path: '/ops/compliance', icon: ShieldCheck, description: 'Document and release readiness' },
    { title: 'HR & Payroll', path: '/ops/hr', icon: BriefcaseBusiness },
    { title: 'Boda Operations', path: '/ops/boda', icon: Bike },
    { title: 'Driver Academy', path: '/ops/academy', icon: GraduationCap },
    { title: 'Fleet Assets', path: '/ops/assets', icon: CarFront },
    { title: 'Partnerships', path: '/ops/partnerships', icon: Handshake },
    { title: 'Alerts & Intelligence', path: '/ops/intelligence', icon: Siren },
  ]},
  { title: 'People & Documents', items: [
    { title: 'Documents', path: '/ops/manage/documents', icon: FileStack },
    { title: 'People', path: '/ops/manage/people', icon: ContactRound },
  ]},
  { title: 'Operations Core', items: [
    { title: 'Assignments', path: '/ops/manage/assignments', icon: Waypoints },
    { title: 'Assignment Checklists', path: '/ops/manage/assignment-checklists', icon: ListChecks },
    { title: 'Assignment Approvals', path: '/ops/manage/assignment-approvals', icon: CheckCheck },
    { title: 'Ops Bookings', path: '/ops/manage/ops-bookings', icon: CalendarClock },
    { title: 'Dispatches', path: '/ops/manage/dispatches', icon: Route },
  ]},
  { title: 'HR & Academy', items: [
    { title: 'Departments', path: '/ops/manage/departments', icon: Building2 },
    { title: 'Employees', path: '/ops/manage/employees', icon: Users },
    { title: 'Employee Contracts', path: '/ops/manage/employee-contracts', icon: FileCheck2 },
    { title: 'Payroll Periods', path: '/ops/manage/payroll-periods', icon: CalendarDays },
    { title: 'Payslips', path: '/ops/manage/payslips', icon: ReceiptText },
    { title: 'Allowances', path: '/ops/manage/employee-allowances', icon: HandCoins },
    { title: 'Deductions', path: '/ops/manage/employee-deductions', icon: Scale },
    { title: 'Salary Advances', path: '/ops/manage/employee-salary-advances', icon: WalletCards },
    { title: 'Attendance', path: '/ops/manage/employee-attendances', icon: UserRoundCheck },
    { title: 'Leave Requests', path: '/ops/manage/leave-requests', icon: CalendarClock },
    { title: 'Academy Workbench', path: '/ops/academy', icon: GraduationCap },
    { title: 'Register Driver', path: '/ops/academy/register', icon: UserRoundPlus },
    { title: 'Testing Checklist', path: '/ops/academy/tests/create', icon: ClipboardCheck },
    { title: 'Drivers', path: '/ops/manage/drivers', icon: IdCard },
    { title: 'Facilitated Visits', path: '/ops/manage/facilitated-visits', icon: Activity },
    { title: 'Vehicle Issuance', path: '/ops/manage/vehicle-issuances', icon: PackageCheck },
    { title: 'Academy Courses', path: '/ops/manage/academy-courses', icon: BookOpenCheck },
  ]},
  { title: 'Remittance', items: [
    { title: 'Remittance Dashboard', path: '/ops/remittance', icon: Gauge },
    { title: 'Assigned Drivers/Riders', path: '/ops/remittance/assigned', icon: Bike },
    { title: 'Record Payment', path: '/ops/remittance/payments/create', icon: Banknote },
    { title: 'Car Contracts', path: '/ops/manage/car-contracts', icon: CarFront },
    { title: 'Boda Contracts', path: '/ops/manage/boda-contracts', icon: Bike },
    { title: 'Welfare Funds', path: '/ops/manage/driver-welfare-funds', icon: HeartHandshake },
    { title: 'Excuses & Waivers', path: '/ops/manage/remittance-adjustments', icon: FileClock },
    { title: 'Payment Batches', path: '/ops/manage/remittance-payment-batches', icon: WalletCards },
  ]},
  { title: 'Fleet, Boda & Pricing', items: [
    { title: 'Fleet Assets', path: '/ops/manage/fleet-assets', icon: CarFront },
    { title: 'Remittance Calendar', path: '/ops/manage/remittance-calendars', icon: CalendarDays },
    { title: 'Remittance Payments', path: '/ops/manage/remittance-payments', icon: CreditCard },
    { title: 'Fuel Prices', path: '/ops/manage/fuel-prices', icon: Fuel },
    { title: 'Rate Cards', path: '/ops/manage/rate-cards', icon: Tags },
    { title: 'Partners', path: '/ops/manage/partners', icon: Handshake },
    { title: 'Equipment', path: '/ops/manage/equipment', icon: Boxes },
    { title: 'Inspections', path: '/ops/manage/inspections', icon: ClipboardCheck },
  ]},
  { title: 'Finance & Control', items: [
    { title: 'Incidents', path: '/ops/manage/incidents', icon: AlertTriangle },
    { title: 'Alerts', path: '/ops/manage/alerts', icon: Siren },
    { title: 'Fare Estimates', path: '/ops/manage/fare-estimates', icon: Gauge },
    { title: 'Settlement Ledger', path: '/ops/manage/settlement-ledgers', icon: Landmark },
    { title: 'Finance Ledger', path: '/ops/manage/finance-ledger', icon: PanelsTopLeft },
    { title: 'Invoices', path: '/ops/manage/invoices', icon: FileText },
    { title: 'Payments', path: '/ops/manage/payments', icon: CreditCard },
    { title: 'Dimensional Income', path: '/ops/manage/income-records', icon: BadgeDollarSign },
    { title: 'Dimensional Expenses', path: '/ops/manage/expense-records', icon: ReceiptText },
    { title: 'Tax Rules', path: '/ops/manage/tax-rules', icon: Scale },
  ]},
  { title: 'Administration', items: [
    { title: 'Admin Users', path: '/admin/users', icon: UserRoundCog },
    { title: 'Access Roles', path: '/admin/roles', icon: ShieldCheck },
    { title: 'Operations Settings', path: '/settings/operations', icon: Settings },
    { title: 'API Health', path: '/system/health', icon: SquareActivity },
    { title: 'Data Catalog', path: '/system/catalog', icon: Warehouse },
  ]},
];

export const allNavigationItems = navigation.flatMap((section) => section.items);

export const quickActions = [
  { title: 'Record remittance', path: '/ops/remittance/payments/create', icon: Banknote },
  { title: 'Add income', path: '/ops/manage/income-records?create=1', icon: BadgeDollarSign },
  { title: 'Add expense', path: '/ops/manage/expense-records?create=1', icon: ReceiptText },
  { title: 'Register driver', path: '/ops/academy/register', icon: UserRoundPlus },
  { title: 'Add person', path: '/ops/manage/people?create=1', icon: ContactRound },
  { title: 'New assignment', path: '/ops/manage/assignments?create=1', icon: Waypoints },
];

export function permissionForPath(path: string): string {
  if (path.startsWith('/admin/')) return 'ops.admin.manage';
  if (path.startsWith('/settings/')) return 'ops.settings.manage';
  if (path.startsWith('/system/')) return 'ops.dashboard.view';
  if (path === '/dashboard' || /^\/ops\/(operations|dispatch|finance|compliance|hr|boda|academy|assets|partnerships|intelligence)$/.test(path)) return 'ops.dashboard.view';
  if (path.startsWith('/ops/remittance') || /\/(car-contracts|boda-contracts|driver-welfare-funds|remittance-adjustments|remittance-payment-batches|remittance-calendars|remittance-payments)/.test(path)) return 'ops.remittance.manage';
  if (path.startsWith('/ops/academy/') || /\/(drivers|facilitated-visits|vehicle-issuances|academy-courses)/.test(path)) return 'ops.academy.manage';
  if (/\/(departments|employees|employee-contracts|payroll-periods|payslips|employee-allowances|employee-deductions|employee-salary-advances|employee-attendances|leave-requests)/.test(path)) return 'ops.hr.manage';
  if (/\/(documents|people)/.test(path)) return 'ops.people.manage';
  if (/\/(assignments|assignment-checklists|assignment-approvals|ops-bookings|dispatches)/.test(path)) return 'ops.operations.manage';
  if (/\/(fleet-assets|fuel-prices|rate-cards|partners|equipment|inspections)/.test(path)) return 'ops.fleet.manage';
  return 'ops.finance.manage';
}

export function canAccessPath(path: string, user: ApiUser | null): boolean {
  if (!user) return false;
  return user.user_type === 'S' || user.permissions.includes(permissionForPath(path));
}
