# Revenue & Engagement Hub

This module turns organization revenue and outreach into reusable, auditable primitives rather than sector-specific code.

## Revenue ledger

- Products model dues, tickets, donations, services, and sponsorships. Money is stored as integer minor units and presented as major currency values by the API.
- An invoice belongs to one member and contains immutable-priced invoice lines. Partial confirmed payments accumulate until the total is settled.
- A unique external payment reference prevents an adapter retry from recording the same payment twice.
- A paid invoice issues each configured product entitlement once. Entitlements carry a key, human label, source invoice/product, start, and optional end date.
- The member endpoint at `GET /v1/member/billing` exposes only the signed-in member's invoices, confirmed ledger payments, and benefits.

## Engagement preparation

Audience segments currently compose membership status, membership type, organization unit, and active entitlement rules. The same rule engine can represent examples such as active HVAC technicians, doctors with an active practice benefit, or fintech companies in a compliance tier.

Queueing a campaign snapshots matching members into `campaign_recipients`. It intentionally leaves the records in `queued` state. A separate authorized adapter must deliver through email, WhatsApp BSP, SMS, or an in-app channel and update delivery outcomes. This prevents the product from presenting a prepared campaign as legally or operationally delivered.

## Permissions

- `revenue.read`, `revenue.write`, `revenue.payment`
- `engagement.read`, `engagement.write`, `engagement.dispatch`

All product, invoice, payment, segment, campaign, and queue actions create tenant-scoped audit events.
