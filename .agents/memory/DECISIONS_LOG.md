# Architectural & Design Decisions Log

This log records major technical, architectural, and UI/UX design decisions made for OpenOrg.

---

### [2026-08-21] Refactor from Multi-Tenant Platform to Single-Tenant Standalone Web App
- **Decision**: Refactored the entire system (`apps/api`, `apps/web`, `apps/cms`, `packages/contracts`) into a **Single-Tenant Standalone Organization Web Application & Company Profile**.
- **Rationale**: User clarified that OpenOrg should NOT act as a SaaS hosting multiple organizations in one DB via `organization_id` columns, header resolvers, or tenant middleware. Instead, it must operate as a dedicated, self-hosted web application for a single organization.
- **Implementation**:
  - Replaced `organizations` table with `site_settings` single-row configuration table.
  - Stripped `organization_id` columns across all 30+ database tables (`members`, `events`, `contents`, `pages`, `organization_units`, `positions`, `credentials`, `learning_activities`, `revenue_products`, `invoices`, `audit_logs`).
  - Removed `tenantPlugin` and `X-Organization` header resolution.
  - Pushed migrations and seeded database (`bun run db:seed`).
  - Verified 100% typecheck (`bun run typecheck`), 100% lint compliance (`bun run lint`), 45 passing unit tests (`bun test`), and clean production builds (`bun run build`).
  - Pushed updated commits across all 3 primary branches (`main`, `staging`, `dev`) using Conventional Commits to `https://github.com/RiprLutuk/openorg.git`.

---

### [2026-08-21] Pivot from Dynamic Page Builder to Standard Modular Web Application
- **Decision**: Refactored `apps/web` from a dynamic JSON-block renderer (`SectionRenderer`) into a clean, self-maintained Next.js application with native React pages (`/`, `/events`, `/structure`, `/verify`, `/join`, `/member`).
- **Rationale**: User requested removing third-party CMS page-builder abstractions to allow direct maintenance of a clean frontend/backend web application centered on core business modules (Membership, Academy SKP/CPD, GovernOS, ComplyFlow Credentials, Revenue).
- **Scope**:
  - `apps/web`: Converted homepage & public routes into direct Next.js React components. Added `/verify` portal for public card/license checks.
  - `apps/cms`: Positioned as Admin Operational Dashboard (Member Management, Academy/SKP, Governance, Compliance & Billing).
  - `apps/api`: Preserved robust Fastify REST API and Drizzle ORM PostgreSQL backend.
