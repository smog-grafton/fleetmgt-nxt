# Remittance accounting controls

Laravel remains the accounting authority. The Next.js profile previews an action, requires explicit confirmation, and then refreshes the canonical ledger returned by `/api/v2/remittance/drivers/{driver}`.

The visible balance is built from separately named components: base expected, dated waivers, cash waivers, manual credits, manual debits, penalties, posted remittance payments, and final owed. Welfare expected/paid/outstanding is displayed independently.

Operational actions use `/api/v2/remittance/drivers/{driver}/actions/preview` and `/api/v2/remittance/drivers/{driver}/actions`. Supported actions are `pause`, `resume`, `rate_change`, `cash_waiver`, `days_waiver`, `manual_credit`, `manual_debit`, and `penalty`. Backdated actions regenerate dated obligations from their effective date. Resume dates are chargeable; the stored pause ends on the preceding day.

Payment mistakes use `POST /api/v2/remittance/payments/{batch}/reverse`. The payment batch and associated finance records are marked reversed and preserved in the audit trail.

Quick-entry paths are intentionally separate from normal authentication. They remain protected by the existing one-purpose Laravel tokens and throttles, and Next.js only validates the token shape before handing the request to Laravel. Configure `LARAVEL_WEB_URL` for this handoff.
