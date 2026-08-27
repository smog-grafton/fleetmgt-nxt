# Operations V2 route migration matrix

All URLs below are implemented by the Next.js application and backed by Laravel `/api/v2`. Resource screens share the same production-grade grid/form/detail engine while retaining resource-specific fields, lookups, validation, capabilities, and actions from the backend schema.

| Area | Next.js routes | Workspace/API |
|---|---|---|
| Command centers | `/dashboard`, `/ops/operations`, `/ops/dispatch`, `/ops/finance`, `/ops/compliance`, `/ops/hr`, `/ops/boda`, `/ops/academy`, `/ops/assets`, `/ops/partnerships`, `/ops/intelligence` | Dedicated dashboard workspaces; `dashboard/*` |
| People & documents | `/ops/manage/documents`, `/ops/manage/people` | Resource grid, upload, preview/download metadata, detail drawer |
| Operations core | `/ops/manage/assignments`, `/ops/manage/assignment-checklists`, `/ops/manage/assignment-approvals`, `/ops/manage/ops-bookings`, `/ops/manage/dispatches` | Resource CRUD plus available workflow actions |
| HR & payroll | `/ops/manage/departments`, `/ops/manage/employees`, `/ops/manage/employee-contracts`, `/ops/manage/payroll-periods`, `/ops/manage/payslips`, `/ops/manage/employee-allowances`, `/ops/manage/employee-deductions`, `/ops/manage/employee-salary-advances`, `/ops/manage/employee-attendances`, `/ops/manage/leave-requests` | Resource workspaces; backend payroll generation and approvals |
| Academy | `/ops/academy`, `/ops/academy/register`, `/ops/academy/tests/create`, `/ops/manage/drivers`, `/ops/manage/facilitated-visits`, `/ops/manage/vehicle-issuances`, `/ops/manage/academy-courses` | Dedicated stepper/checklist plus resource workspaces; `academy/*` |
| Remittance | `/ops/remittance`, `/ops/remittance/assigned`, `/ops/remittance/drivers/:id`, `/ops/remittance/payments/create` | Dedicated dashboards/forms/profile; `remittance/*` |
| Contracts & welfare | `/ops/manage/car-contracts`, `/ops/manage/boda-contracts`, `/ops/manage/driver-welfare-funds`, `/ops/manage/remittance-adjustments`, `/ops/manage/remittance-payment-batches`, `/ops/manage/contracts` | Resource workspaces and contract/calendar actions |
| Fleet, boda & pricing | `/ops/manage/fleet-assets`, `/ops/manage/remittance-calendars`, `/ops/manage/remittance-payments`, `/ops/manage/fuel-prices`, `/ops/manage/rate-cards`, `/ops/manage/partners`, `/ops/manage/equipment`, `/ops/manage/inspections` | Resource workspaces with protected generated records |
| Finance & control | `/ops/manage/incidents`, `/ops/manage/alerts`, `/ops/manage/fare-estimates`, `/ops/manage/settlement-ledgers`, `/ops/manage/finance-ledger`, `/ops/manage/invoices`, `/ops/manage/payments`, `/ops/manage/income-records`, `/ops/manage/expense-records`, `/ops/manage/tax-rules` | Resource workspaces; authoritative finance/settlement APIs |
| Settings & access | `/settings/operations`, `/admin/users`, `/admin/roles` | Secret-safe settings and Super Admin access control |
| System | `/system/health`, `/system/catalog` | Next/Laravel health and resource capability catalog |
| Authentication | `/login`, `/forgot-password`, `/reset-password` | Same-origin BFF; Laravel Passport/password broker |

Every resource also accepts `/ops/manage/{resource}/:id` for a deep-linked record detail drawer. Query parameters preserve paging, search, sort, and filters so lists can be bookmarked and shared.

Legacy customer booking, public quotation/payment, CodeCanyon mobile/vendor, legacy income/expense/reporting, maintenance, and Blade settings routes are not reintroduced.
