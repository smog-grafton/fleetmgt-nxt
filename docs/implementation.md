# Zuri Management V2 implementation

## Architecture

```text
Browser
  ├─ Metronic/ReUI application shell and workspaces
  └─ same-origin /api/* requests + double-submit CSRF token
            ↓
Next.js BFF
  ├─ HTTP-only Passport token cookie
  ├─ authentication/session handlers
  └─ authenticated /api/backend/* proxy
            ↓
Laravel /api/v2
  ├─ Passport authentication
  ├─ Operations V2 permissions and validation
  ├─ domain/remittance/payroll/finance services
  └─ MySQL production system of record
```

The browser never receives the Laravel bearer token. Login stores it in `zuri_ops_token` with `httpOnly`, `sameSite=lax`, a secure flag outside development, and bounded lifetime. Mutating proxy requests must also present the non-HTTP-only `zuri_ops_csrf` cookie through the `X-CSRF-Token` header. The proxy accepts only the configured Laravel origin and normalizes all responses to the Operations V2 JSON envelope.

## Application shell

`components/zuri/app-shell.tsx` implements the production layout: responsive/collapsible left navigation, mobile drawer, header search, quick-create actions, user controls, theme switching, right control sheet, content area, and footer. `config/zuri-navigation.ts` is the single navigation definition. Theme preference supports light, dark, and system modes.

`config/route-registry.ts` maps the friendly admin URLs to specialized workspaces. The catch-all route is deliberate: it keeps navigation, permission-aware rendering, loading, and error handling consistent while still producing distinct URLs for every module.

## Workspaces

- Ten live command-center dashboards cover operations, dispatch, finance, compliance, HR/payroll, boda, academy, assets, partnerships, and intelligence.
- Forty-five schema-driven resource workspaces use the Laravel catalog/schema contract for server paging, search, sorting, filters, field lookups, validation, CRUD drawers, document/image upload, record detail, workflow actions, and guarded deletion.
- Remittance has dedicated dashboard, assigned-driver list, driver/rider profile, payment capture, welfare preview, allocation recalculation, mistaken-payment reversal, and future-allocation repair workflows.
- Academy has a multi-step driver registration flow and dynamic testing checklist.
- Operations settings mask stored secrets; blank secret submissions preserve the configured value.
- Super Admin has dedicated user and role/permission management.
- Health and catalog workspaces expose API/runtime status to authorized operators.

## Business-rule boundary

Money and compliance decisions are not calculated in React. The interface collects inputs and previews results, while Laravel services remain authoritative for decimal arithmetic, allocation order, balances, welfare, calendar generation, payroll, tax, finance ledger, settlement, and audit state. TanStack Query invalidation refreshes every affected view after a successful command.

## Laravel additions

- Forgot/reset-password API endpoints and a Next.js-targeted reset notification.
- Super Admin user and role API endpoints.
- Per-domain Operations V2 permission enforcement for dashboards, resources, remittance, academy, documents, settings, and administration.
- Resource capabilities, safe sorting, immutable/generated-record guards, protected deletion, read-only field stripping, and secret masking.
- Ten `ops.*` permissions seeded by `2026_08_27_120000_add_operations_v2_permissions.php`.

## Production configuration

Use Node 24, set `LARAVEL_API_URL` to the private/reachable `/api/v2` base, set `OPS_ADMIN_URL` to the public Next.js URL, and configure HTTPS. Run `npm run check` before deployment. Deploy Laravel migrations before switching traffic, then build and run Next.js behind the chosen process manager/reverse proxy.
