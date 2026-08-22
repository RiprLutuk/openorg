<div align="center">

# OpenOrg

**Modern, High-Performance Single-Tenant Organization Platform & Management Portal**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.production.yml)
[![Bun](https://img.shields.io/badge/Bun-1.3-FBF0DF?logo=bun&logoColor=black)](https://bun.sh/)

*A dedicated, self-hosted web application and administration suite designed for associations, federations, professional networks, and community organizations.*

[Features](#-key-features) • [Architecture](#-architecture) • [Quickstart](#-local-development-quickstart) • [VPS Deployment](#-production-vps-deployment) • [Documentation](#-documentation-index)

</div>

---

## 🌟 Key Features

OpenOrg combines a headless API, a Next.js public website, and a React CMS admin console into a unified, single-tenant organizational operating system:

- 🏛️ **ComplyFlow & Credential Verification**: Issue cryptographic QR-enabled digital membership cards (KTA), track BNSP certifications, manage CPD/SKP credits, and provide instant public verification portals (`/verify`).
- 👥 **Governance & Unit Management (GovernOS)**: Configurable organizational trees (DPP, DPD, DPC, Korwil, Ethics Committee) with public interactive structure viewers (`/structure`).
- 📋 **Services & Public Registry Hub**:
  - **Technicians Directory (`/technicians`)**: Verified member lookup by city, province, and skill ratings.
  - **Public Complaints & Ethics Desk (`/complaints`)**: Live incident submission, ticket issuance (`CMP-XXXX-YYY`), and instant progress tracker.
  - **Regulations & Policy Repository (`/regulations`)**: AD/ART documents, government circulars, and policy papers with category tabs and downloads.
  - **Skill Championships & Standings (`/championships`)**: National contestant leaderboards, points, and awards.
  - **Registered Clubs (`/clubs`)**: Tanda Klub Terdaftar (TKT) registry and branch management.
  - **Lenders & Fintech Registry (`/lenders`)**: OJK-licensed financing partner verifications.
  - **WHOIS & Infrastructure Lookup (`/whois`)**: Live IP/ASN routing and network status.
  - **Industry Statistics (`/statistics`)**: Performance metrics and quarterly indicators.
- 🎨 **Appearance & Theme Studio**: 100% database-persisted visual theme customizer in CMS Studio with real-time CSS variable propagation (colors, typography, border radius).
- 📱 **Swiss-Style UI/UX & Mobile-First**: Built with high scannability, WCAG AAA contrast, tactile thumb-zone interactions, and zero layout shift.

---

## 🏛 Architecture

```text
                                Internet
                                   │
                     ┌─────────────┴─────────────┐
                     │ DNS: Port 80 / 443 (HTTPS) │
                     └─────────────┬─────────────┘
                                   ▼
                      [ Caddy Reverse Proxy & TLS ]
             (Automated Let's Encrypt / ZeroSSL Certificates)
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
 [ Next.js Web ]             [ React CMS ]               [ Fastify API ]
  (Port 3000)                  (Port 80)                   (Port 4000)
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   ▼
                        [ PostgreSQL Database ]
                         (Drizzle ORM Schema)
```

---

## 🛠 Tech Stack

| Component | Technologies & Libraries |
| :--- | :--- |
| **Monorepo** | Bun Workspaces, Biome Linter & Formatter, TypeScript 5.9 |
| **Public Web** | Next.js 16 (App Router), React 19, Lucide Icons, OKLCH Color Engine |
| **Admin CMS** | Vite, React, TanStack React Query, Lucide Icons, Drag-and-Drop |
| **Backend API** | Fastify 5, Drizzle ORM, Zod, Argon2id, Opaque Sessions, Rate Limiting |
| **Database** | PostgreSQL 15+ / 17 |
| **DevOps & Proxy**| Docker, Docker Compose, Caddy v2 (Automated TLS) |

---

## 🚀 Local Development Quickstart

### 1. Prerequisites
- [Bun](https://bun.sh/) 1.3+
- [PostgreSQL](https://www.postgresql.org/) 15+

### 2. Install & Configure
```bash
# Clone the repository
git clone https://github.com/RiprLutuk/openorg.git
cd openorg

# Install dependencies
bun install --frozen-lockfile

# Configure environment
cp .env.example .env

# Run migrations and seed demo data
bun run db:migrate
bun run db:seed
```

### 3. Start Development Servers
```bash
bun run dev
```

The workspace applications will be available at:
- **Public Website**: [http://localhost:3000](http://localhost:3000)
- **Admin CMS Studio**: [http://localhost:5173](http://localhost:5173)
- **REST API Server**: [http://localhost:4000](http://localhost:4000)
- **API Documentation**: [http://localhost:4000/documentation](http://localhost:4000/documentation)

---

## 🚢 Production VPS Deployment

Deploying OpenOrg to a Linux VPS (Ubuntu/Debian) is automated using Docker Compose and Caddy:

1. **Clone repository on VPS**:
   ```bash
   git clone https://github.com/RiprLutuk/openorg.git /opt/openorg
   cd /opt/openorg
   ```
2. **Configure production environment**:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
3. **Run automated deployment script**:
   ```bash
   ./ops/deploy.sh .env.production
   ```
4. **Seed initial database (First time only)**:
   ```bash
   docker compose --env-file .env.production -f docker-compose.production.yml exec api bun run db:seed
   ```

👉 For detailed VPS setup, DNS records, firewall configuration, and automated backups, see the **[Complete VPS Deployment Guide](docs/vps-deployment.md)**.

---

## 🚦 Quality Gates & Verification

To ensure total code quality and reliability, all code is verified through strict automated checks:

```bash
# Run strict TypeScript typechecking
bun run typecheck

# Run Biome linting and code formatting
bun run lint

# Run unit & integration test suites
bun test

# Run full monorepo production build
bun run --filter '*' build
```

---

## 📚 Documentation Index

- 📖 [VPS Deployment Runbook](docs/vps-deployment.md) - Complete production guide for Linux VPS.
- ⚙️ [Customization & Theme Studio](docs/customization.md) - Design tokens, branding, and color palettes.
- 🛡️ [ComplyFlow Architecture](docs/complyflow.md) - Credential schemes, trust levels, and verification.
- 🏛️ [GovernOS Architecture](docs/governos.md) - Governance hierarchy and office terms.
- 🎓 [Academy & Credit Ledger](docs/academy-credit-ledger.md) - Learning credits and SKP/CPD issuance.

---

## 🤝 Contributing

We welcome contributions! Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Security Policy](SECURITY.md) before opening a pull request.

---

## 📄 License

OpenOrg is open-source software licensed under the **[Apache License 2.0](LICENSE)**.
