# Architectural & Design Decisions Log

This log records major technical, architectural, and UI/UX design decisions made for OpenOrg.

---

### [2026-08-21] Pivot from Dynamic Page Builder to Standard Modular Web Application
- **Decision**: Refactored `apps/web` from a dynamic JSON-block renderer (`SectionRenderer`) into a clean, self-maintained Next.js application with native React pages (`/`, `/events`, `/structure`, `/verify`, `/join`, `/member`).
- **Rationale**: User requested removing third-party CMS page-builder abstractions to allow direct maintenance of a clean frontend/backend web application centered on core business modules (Membership, Academy SKP/CPD, GovernOS, ComplyFlow Credentials, Revenue).
- **Scope**:
  - `apps/web`: Converted homepage & public routes into direct Next.js React components. Added `/verify` portal for public card/license checks.
  - `apps/cms`: Positioned as Admin Operational Dashboard (Member Management, Academy/SKP, Governance, Compliance & Billing).
  - `apps/api`: Preserved robust Fastify REST API and Drizzle ORM PostgreSQL backend.
