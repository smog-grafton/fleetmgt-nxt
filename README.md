# Zuri Management V2

The Next.js administration console for Zuri Ride's Operations V2 platform. It is built from the locally installed Metronic 9.5/ReUI starter kit and communicates with the Laravel application exclusively through `/api/v2`.

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm
- The Laravel application at `/Applications/XAMPP/xamppfiles/htdocs/zurimgt/framework`
- A configured Laravel Passport installation and mail transport

## Local setup

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

The default frontend is `http://localhost:3000`. Set the Laravel `.env` value below so password-reset emails return users to this application:

```dotenv
OPS_ADMIN_URL=http://localhost:3000
```

The only browser-visible configuration is the app name, currency, and optional base path. `LARAVEL_API_URL` is server-only. Passport tokens are held in an HTTP-only, same-site cookie by the Next.js BFF and are never exposed to browser JavaScript.

## Commands

```bash
npm run dev        # local development
npm run check      # lint, typecheck, and production build
npm run build      # optimized production bundle
npm start          # serve the production bundle
```

## Design and ownership

- Metronic/ReUI components and tokens are the design system; the removed 39 vendor demo layouts are preserved in Git history.
- Laravel is the system of record and owns authorization, validation, remittance allocation, payroll, finance, and settlement calculations.
- Next.js owns the responsive operator experience, route composition, tables, drawers, filters, charts, and workflow orchestration.
- Every protected request travels browser → same-origin Next.js BFF → Passport-protected Laravel API.

See [implementation.md](docs/implementation.md), [route-migration-matrix.md](docs/route-migration-matrix.md), and [validation-report.md](docs/validation-report.md).
