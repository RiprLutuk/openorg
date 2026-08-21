# Project Context & Knowledge Base

**Project**: OpenOrg  
**Description**: Open-source, multi-tenant organization platform with headless CMS, API, and public website. Built with TypeScript and PostgreSQL (no PHP).

---

## 🏗️ Architecture & Apps

| Package / App | Path | Tech Stack | Port | Purpose |
|---|---|---|---|---|
| **API** | `apps/api` | Fastify, Drizzle ORM, PostgreSQL, Zod, Argon2id | `http://localhost:4000` | Headless API, tenant isolation, RBAC, session auth, audit logs |
| **CMS Studio** | `apps/cms` | React, Vite | `http://localhost:5173` | CMS interface for managing pages, events, members, brand theme |
| **Web** | `apps/web` | Next.js App Router, SSR | `http://localhost:3000` | Multi-tenant public website, SEO metadata, form validation |
| **Contracts** | `packages/contracts` | Zod | N/A | Shared schemas, page blocks, dynamic theme contracts |

---

## 🛠️ Tech Stack & Tooling

- **Runtime & Workspace**: Bun 1.3.14+ monorepo (`bun run dev`, `bun run build`, `bun test`)
- **Database**: PostgreSQL 15+ (`psql -U lutuk -p 1921 -d openorg`)
- **Linter & Formatter**: Biome (`bun run lint`, `bun run lint:fix`)
- **Type Checker**: TypeScript (`bun run typecheck`)

---

## 🔑 Key Commands

- `bun run dev`: Start API, CMS, and Web concurrently
- `bun run dev:api`: Start API dev server
- `bun run dev:cms`: Start CMS dev server
- `bun run dev:web`: Start Web dev server
- `bun run db:migrate`: Run database migrations
- `bun run db:seed`: Seed demo data
- `bun run typecheck`: Run TypeScript type checking across all packages
- `bun run lint`: Run Biome linter check
