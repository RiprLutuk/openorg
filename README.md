# OpenOrg

OpenOrg is an open-source, multi-tenant organization platform with a separated
CMS, API, and public website. It is built with TypeScript and PostgreSQL—there
is no PHP runtime.

It is designed for associations, communities, nonprofits, professional
networks, humanitarian groups, animal-welfare organizations, financial
communities, and other member-led organizations. Content, pages, events,
members, form submissions, organization structure, and the public brand can be
managed without editing source code.

## What is included

- Headless API: Fastify, Drizzle ORM, PostgreSQL, Zod, opaque sessions, Argon2id,
  tenant isolation, RBAC, rate limiting, security headers, and audit logs.
- CMS Studio: React and Vite workspace for pages, stories, events, membership
  applications, digital cards, credential verification, and dynamic brand
  tokens.
- Public website: Next.js App Router with server rendering, responsive page
  blocks, dynamic navigation, SEO metadata, and server-validated forms.
- Shared contracts: one Zod contract package for page blocks and theme data.
- ComplyFlow: configurable credential schemes, evidence, trust levels,
  verification history, Industry Pack presets, and compliance-gated approval.
- GovernOS: configurable units and positions, traceable office terms, audited
  appointments, and a public organization structure sourced from the same data.
- Academy & Credit Ledger: learning activities, enrollment and waitlists,
  verified attendance, SKP/CPD schemes, and idempotent credit issuance.
- Portable operations: Bun workspaces, Docker Compose, and GitHub Actions CI.

## Architecture

```text
Browser ────────► Next.js public website ───────┐
                                                │
CMS operator ──► React CMS Studio ──────────────┼──► Fastify API ──► PostgreSQL
                                                │
Custom domain ─► tenant/domain resolver ────────┘
```

The API resolves an organization from `X-Organization` in development or from
the request hostname in production. Every tenant-owned query is constrained by
`organizationId`.

## Local development

Requirements:

- Bun 1.3.14 or newer
- PostgreSQL 15 or newer

This repository is currently configured for the local passwordless database:

```bash
psql -U lutuk -p 1921 -d openorg
```

## Production deployment

Use the dedicated production stack; it separates migration from application startup, does not seed demo data, keeps PostgreSQL private, and terminates TLS automatically. See [the go-live runbook](docs/go-live.md) and start with `.env.production.example`.

Install and initialize:

```bash
cp .env.example .env
bun install --frozen-lockfile
bun run db:migrate
bun run db:seed
```

Set a strong `SESSION_SECRET` and seed password in `.env` before seeding a new
environment. Start all three applications:

```bash
bun run dev
```

Then open:

- Public website: <http://localhost:3000>
- CMS Studio: <http://localhost:5173>
- API health: <http://localhost:4000/health>
- API explorer: <http://localhost:4000/documentation>

The included demo data uses organization slug `demo`. Credentials are read from
`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`; never reuse demo credentials in a
deployed environment.

## Dynamic brand and color palette

Open **CMS Studio → Brand & theme**. An organization owner can select a curated
palette or edit all five tokens directly:

- Primary
- Secondary
- Accent
- Surface
- Foreground

Heading font, body font, and corner radius are stored with the same theme. The
API persists these values per organization and the public Next.js site turns
them into CSS variables at request time. No rebuild or manual CSS palette edit
is required. The default demo uses clean royal blue, graphite, and a restrained
coral accent—not green.

See [docs/customization.md](docs/customization.md) for tenant and theme details.
See [docs/complyflow.md](docs/complyflow.md) for the universal credential model
and Industry Pack extension boundary.
See [docs/governos.md](docs/governos.md) for the configurable governance
hierarchy and appointment lifecycle.
See [docs/academy-credit-ledger.md](docs/academy-credit-ledger.md) for learning,
attendance, and professional-credit integrity rules.

## Quality gates

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Docker Compose

Docker Compose starts its own password-protected PostgreSQL service and does not
change the local passwordless database described above.

```bash
SESSION_SECRET="replace-with-at-least-32-random-characters" \
docker compose up --build
```

Migrations run when the API container starts. Run `bun run db:seed` explicitly
only when you intentionally want demo data; it is never part of the production
stack.

## Security and contributions

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability and
[CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. OpenOrg is
licensed under the [Apache License 2.0](LICENSE).
