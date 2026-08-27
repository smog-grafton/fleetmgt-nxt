# Validation report

Validation date: 2026-08-27 (Africa/Kampala)

## Next.js

- Upgraded to Next.js 16.3.3; `npm audit` reports 0 vulnerabilities.
- `npm run lint`: passed with 0 errors and 0 warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; all authentication, BFF, health, and dynamic application routes compiled.
- Runtime smoke: login returned 200, protected dashboard redirected to login, unauthenticated session returned 401, and invalid credentials returned the Laravel validation envelope.
- Node 24 is pinned in `.nvmrc`; the local verification host used unsupported Node 23.11 successfully but should not be used for deployment.

## Laravel

- Full suite: 11 passed plus 1 PHPUnit deprecation classification, 177 assertions, 0 failures.
- `/api/v2` exposes 62 registered routes.
- Public health/capabilities, Passport protection, validation envelope, CORS, retired legacy routes, dashboard read-only behavior, resource contract, Super Admin contract, and restricted Office Admin permissions are covered.
- Changed PHP files pass syntax checks. Vendor packages emit pre-existing PHP 8.4 deprecation notices.

## Database

- `2026_08_27_120000_add_operations_v2_permissions` ran in batch 8.
- Database remains at 102 tables; no operations/remittance/payroll/finance table was dropped or rewritten by this phase.
- Ten `ops.*` permissions exist. Super Admin has all 10 Operations V2 permissions; Admin has the intended 8 and is excluded from settings/access administration.
- Existing production-equivalent business data remains available through the tested API contract.

## Security checks

- Passport bearer token is absent from login response payloads returned to the browser.
- Auth cookie is HTTP-only, same-site, secure in production, and cleared on logout/failed session refresh.
- Mutations through the BFF require double-submit CSRF validation.
- Laravel performs domain authorization and input validation independently of the UI.
- Stored secret settings are masked and cannot be read back through the settings endpoint.
