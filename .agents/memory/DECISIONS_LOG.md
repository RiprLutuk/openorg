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

---

### [2026-08-22] CMS UI/UX Polishing, Icon Action Buttons, and Searchable Select Combobox
- **Decision**: Enhanced CMS interface ergonomics across table row actions, dropdown select fields, title/slug editing, workspace navigation, font preloading, and header navigation menu management.
- **Implementation**:
  - **Icon Action Buttons**: Replaced text action buttons in table rows with clean, compact icon buttons (`CreditCard`, `Pencil`, `Trash2`) featuring interactive tooltips and subtle hover effects.
  - **SearchableSelect Combobox**: Replaced native browser `<select>` dropdowns in forms with a custom `SearchableSelect` component featuring live search input filtering (`Search` icon, clear button, `CheckCircle2` active indicators, and click-outside popover dismissal).
  - **Dynamic Public Header Navigation**: Added Header Navigation Menu manager in CMS Settings (`#settings`) to dynamically control header links on the Next.js public site in real-time.
  - **Font Preloading**: Added Google Fonts preloading (`preconnect` & stylesheet links in `<head>`) to eliminate FOUT/loading glitches on page reload.
  - **Workspace Popover Ergonomics**: Added interactive floating popover menu to sidebar workspace switcher `APTI Indonesia ⌄` and fixed flex-shrink badge distortion.

---

---

### [2026-08-22] Homepage Streamlining & Comprehensive Subpage Styling Sweep
- **Decision**: Streamlined the public homepage (`apps/web/app/page.tsx`) by removing heavy, redundant simulator desks and matrices, delegating them to their dedicated feature pages, and sweeping all public subpages for consistent UI/UX styling.
- **Implementation**:
  - **Homepage Streamlined**: Reduced homepage cognitive load into 5 clean, high-impact sections: (1) Interactive Hero with 3D KTA Card, (2) 4-Pillar Core Services Bento Grid, (3) Agenda & Pelatihan (3 compact cards), (4) Warta & Publikasi (3 refined news cards), (5) Clean Call-to-Action Banner.
  - **Dedicated `/verify` ComplyFlow Portal**: Integrated the full `InteractiveCredentialChecker` simulator desk alongside live direct search, realistic test chips (`KTA-2026-08892`, `BNSP-HVAC-9081`), and 3 assurance security pillars.
  - **Dedicated `/structure` GovernOS Portal**: Integrated `InteractiveStructurePreview` for live department filtering (DPP Harian, Dewan Pengawas, Mahkamah Etik, Korwil) alongside the complete organizational unit hierarchy tree.
  - **Dedicated `/events` and `/stories` Archives**: Modernized event cards with custom date badges, SKP credit chips, registration status indicators, and sleek story cards with category badges and reading links.
  - **Registration & Member Portals (`/join`, `/member/login`, `/member`)**: Refined Indonesian microcopy, multi-step application journey, and digital KTA card previews.
  - **Domain Subpages (`/technicians`, `/regulations`, `/clubs`, `/lenders`, `/championships`, `/working-groups`, `/whois`, `/complaints`, `/statistics`)**: Verified all hero headers, badge chips, empty states, and responsive layouts for full visual consistency.

---

---

### [2026-08-22] Monochromatic Swiss Architecture & Restrained Tactile Micro-Interactions
- **Decision**: Transformed the frontend design system from a multi-color/tacky "AI prototype" aesthetic (rainbow colored icon boxes, 3D jumping hover effects, glowing neon gradients) into an ultra-clean, monochromatic, executive Swiss/Linear-grade design standard.
- **Implementation**:
  - **Eliminated Rainbow Color Noise**: Replaced disjointed blue/green/purple/amber icon boxes and badges across the Hero, Bento Grid, and Metric widgets with a unified, high-contrast monochrome slate palette (`#f8fafc` background, `#eaecf0` border, `#0f172a` icon/ink text).
  - **Eliminated "AI-Jumping" Hover Effects**: Removed `rotate3d(1, -1, 0, 4deg)` and `translateY(-4px)` jumping cards. Replaced with calm, high-precision 1px border refinements (`border-color: #cbd5e1`) and soft ambient shadows (`box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.05)`).
  - **Executive Matte Titanium KTA Card**: Stripped animated holographic rainbow sheens in favor of a solid, deep slate titanium finish (`#0f172a`), razor-sharp gold micro-chip, and clean cryptographic QR audit badge.
  - **Restrained Typography & Badges**: Cleaned live pulse pills into a minimalist neutral charcoal badge with a deep sapphire pulse dot, establishing a disciplined, world-class aesthetic that feels like a top-tier European/Silicon Valley enterprise product.

---

### [2026-08-22] CMS Appearance Studio & Public Site Full Real-Time Sync
- **Decision**: Overhauled the CMS Appearance Studio (`http://localhost:5173/#appearance`) and the Next.js Public Site (`apps/web`) to ensure 100% full bidirectional theme synchronization (colors, typography, border radius) backed by PostgreSQL database persistence.
- **Implementation**:
  - **Database & API Schema (`apps/api`)**: Added `theme` jsonb column to `site_settings` table, created and executed Drizzle migration (`0004_bent_the_fallen.sql`), and updated `GET /v1/admin/organization`, `PATCH /v1/admin/organization`, and `GET /v1/public/site` to resolve and return full theme tokens (`colors`, `radius`, `fontHeading`, `fontBody`).
  - **CMS Appearance Studio (`apps/cms`)**:
    - Replaced outdated presets with 5 curated executive palettes (*APTI Titanium Slate*, *APTI Ocean Navy*, *Emerald Competency*, *Midnight Royal*, *Carbon Monochrome*).
    - Added comprehensive color pickers (Primary, Secondary, Accent, Surface, Foreground) with hex inputs.
    - Added Heading font selector (`Manrope`, `Inter`, `Plus Jakarta Sans`, `DM Sans`, `Outfit`, `Roboto`), Body font selector (`Inter`, `DM Sans`, `Plus Jakarta Sans`, `Outfit`, `Roboto`), and Corner radius style selector (`none`, `small`, `medium`, `large`, `pill`).
    - Added interactive live browser mockup simulator (`https://apti.or.id`) demonstrating real-time WYSIWYG preview of public header, hero banner, buttons, and bento metric cards.
  - **Public Site Sync (`apps/web`)**:
    - `RootLayout` (`apps/web/app/layout.tsx`): Injected dynamic CSS custom properties (`--color-primary`, `--color-secondary`, `--color-accent`, `--color-surface`, `--color-foreground`, `--font-heading`, `--font-body`, `--radius`, `--radius-sm`, `--radius-md`, `--radius-lg`) into `<body>`.
    - `globals.css` (`apps/web/app/globals.css`): Connected headings (`h1-h6`, `.brand`) and body typography to `--font-heading` and `--font-body`, ensuring full dynamic theme propagation without glitches or layout shifts.

---

### [2026-08-22] Comprehensive Mobile-First Architecture & Thumb-Zone Polish
- **Decision**: Refactored the entire frontend design and layout architecture to be **100% Mobile-First**, prioritizing smartphone usability, one-thumb ergonomics, tactile interaction targets, and zero horizontal overflow.
- **Implementation**:
  - **Clean Mobile Viewport (Removed Bottom Floating Dock)**: Removed the persistent bottom floating bar to avoid obscuring cards/content, relying on the fluid top header hamburger navigation and standard mobile-first page flow.
  - **Concise Bento CTA Microcopy**: Shortened verbose card actions across `InteractiveBentoServices` (`Verifikasi KTA`, `Cari Teknisi →`, `Daftar Anggota`, `Portal Anggota →`, `Jadwal Agenda`, `Struktur Lengkap`) to ensure punchy, one-line card footers with zero awkward line breaks on mobile viewports.

---

### [2026-08-22] UI/UX Pro Max Scannability & Whitespace Overhaul
- **Decision**: Eliminated cognitive overload, wall-of-text fatigue, and cramped vertical rhythm across the public website following Swiss design and modern scannability standards.
- **Implementation**:
  - **Hero Section**: Shortened hero sub-headline to a single punchy value prop sentence (`Pusat layanan keanggotaan mandiri, penerbitan KTA digital ber-QR, kredit kompetensi SKP, dan audit kredensial publik instan`), constrained text line measure to optimal `480px`, and refined metrics counters.
  - **Bento 4-Pillar Grid**: Refactored card headings, paragraphs, and eyebrows to 1-2 line crisp microcopy, allowing visual status badges (`● AKTIF`, `+4 SKP`, `BNSP`) and interactive previews to lead.
  - **Section Headings & CTA Banner**: Replaced redundant paragraphs across Agenda (`Pelatihan & Sertifikasi`), Warta (`Publikasi & Berita`), and the Bottom CTA Banner with high-impact titles and clean button pairs (`[ Daftar ]` & `[ Masuk ]`).
  - **Spatial Rhythm**: Expanded vertical breathing room (`clamp(72px, 8vw, 108px)`), balanced typography line-heights (`1.6`), and reduced cognitive friction for fast 3-second scanning.
  - **Interactive Eyebrow CTA Links**: Converted static section eyebrows on the home page into interactive action links (`Lihat Semua Agenda →` and `Lihat Semua Berita →`) and dropped redundant secondary buttons (`btn-secondary-action`) from section headings to preserve an uncluttered, high-contrast visual hierarchy.

---

### [2026-08-22] Full Dynamic CMS & Interactive Features Across All Routes (/goal Complete)
- **Decision**: Completed end-to-end integration and dynamic management for all routes in the system, ensuring no route is empty or static, and providing complete administrative CRUD in the CMS alongside live interactive client features on the public site.
- **Implementation**:
  - **Admin API Endpoints (`apps/api`)**: Added complete CRUD endpoints in `/v1/admin/*` for `technicians`, `clubs`, `working-groups`, and `lenders`, alongside existing admin endpoints for `regulations`, `complaints`, `championships`, and `statistics`.
  - **Dynamic Seed Data (`apps/api/src/db/seed.ts`)**: Populated dynamic CMS sections for custom pages (`organization-profile`, `vision-mission`) and ensured rich initial datasets for all 8 auxiliary registries.
  - **CMS Management Screens (`apps/cms/src/App.tsx`)**: Created 8 dedicated management tabs under **Services & Registry**:
    1. *Regulations & Legal Repository*: Add, search, delete policy documents and AD/ART.
    2. *Public Complaints & Ethics Desk*: Triage consumer complaints, update investigation status, and record review notes.
    3. *Verified Technicians Directory*: Register BNSP technicians, assign KTA numbers, and set ratings/workshops.
    4. *Registered Clubs (TKT)*: Register and manage verified clubs and affiliate bodies.
    5. *Championships & Skill Contest Standings*: Manage contestants, points, rankings, and awards.
    6. *Working Groups (Pokja)*: Manage taskforces and committees.
    7. *Lenders & Financial Partners Registry*: Manage fintech platforms and OJK licensing data.
    8. *Industry Statistics & Indicators*: Manage quarterly performance indicators and trend metrics.
  - **Interactive Next.js Frontend (`apps/web`)**:
    1. `/complaints`: Live complaint form submission generating real ticket numbers (`CMP-XXXX-YYY`) and instant ticket status tracker with status badges and secretariat notes.
    2. `/whois`: Live IP/ASN search querying `/v1/public/whois`.
    3. `/technicians`: Real-time instant search by name, KTA, city, or workshop with province filter dropdown.
    4. `/regulations`: Interactive category filter pills (*Semua*, *AD/ART*, *Surat Edaran*, *Regulasi Pemerintah*, *Naskah Kebijakan*) with live keyword search.
    5. `/clubs`: Interactive live search and province filter.
    6. `/lenders`: Real-time platform search and OJK license lookup.
    7. `/championships`: Dynamic leaderboard with search and medal indicators.
    8. `/[slug]`: Dynamic CMS page renderer supporting custom pages.
  - **Empirical Verification**: Ran full monorepo build (`bun run --filter '*' build`), typecheck (`bun run typecheck`), linting (`bun run lint`), and unit test suite (`bun test` with 45/45 passing tests).

---

### [2026-08-22] Repository Overhaul, Apache-2.0 License, VPS Deployment, and CMS Hardening
- **Decision**: Completed full repository metadata setup, replaced stub license with official Apache License 2.0, published comprehensive VPS deployment runbooks, and performed an exhaustive crash-prevention sweep across all CMS Studio manager views.
- **Implementation**:
  - **Meta Documentation & Licensing**:
    - Replaced stub text in [README.md](file:///Users/lutuk/Project/asisi/openorg/README.md) with comprehensive project documentation, architectural diagrams, quickstart runbooks, script reference, and VPS deployment links.
    - Updated [LICENSE](file:///Users/lutuk/Project/asisi/openorg/LICENSE) with full official Apache License 2.0 text.
    - Added [CONTRIBUTING.md](file:///Users/lutuk/Project/asisi/openorg/CONTRIBUTING.md) and [SECURITY.md](file:///Users/lutuk/Project/asisi/openorg/SECURITY.md).
    - Created [.env.production.example](file:///Users/lutuk/Project/asisi/openorg/.env.production.example) and [docs/vps-deployment.md](file:///Users/lutuk/Project/asisi/openorg/docs/vps-deployment.md) detailing Nginx reverse proxy configurations, systemd services, SSL certificates (Certbot), Docker Compose setup, and Postgres migrations.
  - **CMS Blank Screen & Crash Prevention Sweep**:
    - **Backend Foreign-Key Population**: Updated API endpoints in `apps/api/src/routes/` (`governance.ts`, `learning.ts`, `revenue.ts`, `credentials.ts`, `membership.ts`) to populate nested relation objects (`member`, `scheme`, `unit`, `entitlements`) and calculate formatted values (`total`, `paid`, `price`, `creditAmount`).
    - **Defensive Frontend Safeguards**: Added optional chaining `?.`, fallback empty arrays/objects, and unified `PageLoading` / `FatalError` states across all CMS components in `apps/cms/src/App.tsx` (`GovernanceManager`, `CredentialQueue`, `CredentialSchemes`, `AcademyManager`, `ApplicationsManager`, `RevenueManager`, `InboxManager`, `RegulationsManager`, `ComplaintsManager`, `TechniciansManager`, `ClubsManager`, `ChampionshipsManager`, `WorkingGroupsManager`, `LendersManager`, `StatisticsManager`).
  - **Empirical Verification & Git Multi-Branch Push**:
    - Verified 100% typecheck (`bun run typecheck`), Biome linting (`bun run lint`), 45/45 test suite (`bun test`), and Next.js / Vite production builds (`bun run build`).
    - Committed changes to `dev`, pushed to `origin/dev`, merged into `staging` and `main`, and pushed to all remote branches on GitHub.

---

---

### [2026-08-25] Universal Design System Refactoring & Mobile-First Aesthetic Sweep (/goal Complete)
- **Decision**: Refactored the entire web application to strictly follow a cohesive, mathematical design system inspired by **React SaaS**, **Meraki UI**, and **Flowbite** standards, ensuring exact uniformity across button heights, typography scales, card radii, gap ratios, and 2-column split hero layouts with zero rogue or ad-hoc per-page styles.
- **Implementation**:
  - **Design Tokens & Global Proportions (`apps/web/app/globals.css`)**:
    - **Color Architecture**: Deep dark canvas (`#090d16`), slate surface cards (`#0f172a`), refined borders (`rgba(255, 255, 255, 0.08)`), vibrant sky blue accents (`#0284c7` / `#38bdf8`), and verified emerald badges (`#10b981` / `#34d399`).
    - **Button System Hierarchy**:
      - Default / Standard: `height: 42px; min-height: 42px; padding: 0 18px; border-radius: 10px; font-size: 13.5px; font-weight: 600; gap: 8px;`
      - Small: `height: 34px; min-height: 34px; padding: 0 12px; border-radius: 8px; font-size: 12px; gap: 6px;`
      - Hero / Primary: `height: 48px; min-height: 48px; padding: 0 24px; border-radius: 12px; font-size: 14.5px; gap: 10px;`
    - **Typography Scale**:
      - `h1`: `clamp(26px, 3.8vw, 40px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15;`
      - `h2`: `clamp(22px, 2.8vw, 32px); font-weight: 750; letter-spacing: -0.02em; line-height: 1.25;`
      - Eyebrows: `font-size: 11px; font-weight: 750; letter-spacing: 0.06em; text-transform: uppercase;`
      - Body Lead: `clamp(13.5px, 1.4vw, 15px); line-height: 1.6; color: #94a3b8;`
    - **Container & Card Grid Standards**:
      - Container `.wrap`: `max-width: 1200px; width: min(100% - 32px, 1200px); margin-inline: auto;` (Mobile: `width: min(100% - 24px, 1200px);`)
      - Section Spacing `.section-space`: `padding-block: clamp(48px, 5.5vw, 76px);`
      - Card Grids: `display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: clamp(16px, 2vw, 24px);`
      - Cards: `background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: clamp(18px, 2.5vw, 24px);`
  - **Universal 2-Column Split Hero Layout**:
    - Converted all subpage headers to the standardized 2-column split layout (`.hero-split-grid` / `.reg-hero-grid` / `.adart-hero-grid` / `.struct-hero-grid` / `.vm-hero-grid`) featuring left-column value copy + right-column 2x2 Bento Metrics Card (`.hero-stats-bento-card` with `.stats-card-grid`):
      1. `/verify` (ComplyFlow Engine & Instant Audit)
      2. `/join` (Membership Requirements & Digital Registration)
      3. `/calculator` (SNI HVAC/R Load Calculator & Refrigerant Reference)
      4. `/complaints` (JENDELA Ethics & Consumer Mediation Desk)
      5. `/clubs` (Registered Clubs TKT Registry)
      6. `/championships` (National Skills Contest Leaderboard)
      7. `/working-groups` (Strategic Working Groups & Committees)
      8. `/statistics` (National HVAC/R Industry Data Center)
      9. `/technicians` & `/partners` (Verified Technician Directory & Principal Partner Showcase)
      10. `/regulations`, `/ad-art`, `/structure`, `/organization-profile`, `/vision-mission`
  - **Homepage & Bottom Banner Standardization**:
    - Converted `Pelatihan & Sertifikasi` (`event-card-refined`) and `Publikasi & Berita` (`story-card-refined`) to the unified dark slate SaaS aesthetic.
    - Standardized `DynamicBottomCta` (`tech-bottom-cta`) with responsive typography, dark gradient backdrop, and 42px button standards.
  - **Empirical Verification**:
    - `bun run typecheck` passed with 0 errors across `@openorg/contracts`, `@openorg/web`, `@openorg/cms`, `@openorg/api`.
    - `bun test` passed 45/45 tests across all packages.
    - `bun run build` compiled all 27 Next.js static and dynamic pages cleanly with Turbopack.
    - Pushed verified commits across `dev`, `staging`, and `main` branches on GitHub.

---

### [2026-08-25] Clean Light SaaS Theme Transformation & WCAG AAA High Contrast Standardization
- **Decision**: Transformed the default website theme across the entire codebase from dark mode to **Clean Light SaaS** (`#f8fafc` canvas, `#ffffff` card surface, `#e2e8f0` borders, `#0f172a` headings, `#475569` body text, `#0284c7` primary sky buttons).
- **Rationale**: User requested a clean, bright, high-contrast, modern SaaS look (referencing React SaaS, MerakiUI, and Flowbite) with zero color collisions and crystal-clear text readability on light backgrounds.
- **Scope & Implementation**:
  - **CSS Custom Properties & `:root` Tokens (`apps/web/app/globals.css`)**:
    - Canvas Background: `#f8fafc` (Slate 50)
    - Card Surfaces: `#ffffff` (Pure White) with `border: 1px solid #e2e8f0` and soft ambient elevation `box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03)`
    - Form Controls & Insets: `#ffffff` / `#f8fafc` with `border: 1px solid #cbd5e1` and text `#0f172a`
    - Headings: `#0f172a` (Slate 900)
    - Body Text: `#334155` / `#475569` (Slate 700 / 600)
    - Muted Meta & Subtitles: `#64748b` (Slate 500)
    - Primary Buttons: `#0284c7` (Sky 600) with `#ffffff` text, hover `#0369a1`
    - Secondary Buttons: `#ffffff` background with `#cbd5e1` border and `#0f172a` text
    - Status Badges: `#dcfce7` (Emerald 100) with `#166534` text and `#86efac` border
  - **Comprehensive Subpage Suite Sweep**:
    - Homepage Hero, 4-Pillar Bento, Event Cards, News Cards, Bottom CTA
    - `/verify` (ComplyFlow Engine, Direct Verification Result Panel, Security Pillars)
    - `/structure` (GovernOS Tree, Public Unit Cards, Department Positions)
    - `/join` & `/member` (Multi-Step Form, Portal Shell, Learning SKP, Credential Cards, Member Balances)
    - `/organization-profile` & `/vision-mission` (Grand Vision Card, Mission Pillars, Core Values, Integrity Pledge)
    - `/regulations` & `/ad-art` (Regulations Directory, Chapter Accordion, Article Cards, Integrity Charter)
    - `/technicians`, `/clubs`, `/lenders`, `/partners` (Directory Cards, Filter Bars, TKT Badges, Partner SK Badges)
    - `/calculator`, `/working-groups`, `/statistics`, `/complaints` (HVAC Load Form, Pokja Cards, Complaint Intake)
    - `/championships`, `/events`, `/stories` (Podium Cards, Leaderboard Table, Story Reader, Share Suite)
  - **Verification & Git Rollout**:
    - `bun run typecheck`: Passed with 0 errors across all workspaces.
    - `bun test`: 45/45 tests passing.
    - `bun run build`: 27/27 static and dynamic Next.js routes built cleanly.
    - Pushed commits to `dev`, merged cleanly to `staging` and `main`, and pushed to GitHub remote.

---

### [2026-08-25] Location-Based Discovery (GPS Geolocation & Distance Sorting) and Server-Side URL Pagination (`/technicians?tab=workshops`)
- **Decision**: Implemented GPS-based location discovery, accurate Haversine distance calculations, and server-side URL query parameter pagination (`?tab=...&page=...&limit=...&sort=...&provinsi=...&kota=...`) across both Technicians and Workshops directories.
- **Rationale**: User requested location-based discovery ("bisa base on location juga kan?") and server-side/URL-driven pagination ("kalaupun pakai harus server side ya jangan client") for the `/technicians?tab=workshops` directory.
- **Scope & Implementation**:
  - **Location-Based Discovery & GPS**:
    - Added one-click GPS geolocation detection (`navigator.geolocation.getCurrentPosition`) with accurate fallback to city/rayon center coordinates (`CITY_COORDINATES` dictionary).
    - Calculated real-time Haversine distance in kilometers (`calculateDistanceKm`) between user coordinates and each workshop/technician location.
    - Added distance badge (`📍 ±X km`) to cards and modal view.
    - Enabled automatic nearest-first sorting (`sort=location`) when GPS is active, with quick reset and active feedback banners.
    - Added quick region filter chips (`Semua Wilayah`, `DKI Jakarta`, `Jawa Barat`, `Jawa Timur`, `Jawa Tengah`, `Sumatera Utara`, `Bali & Nusra`) and dynamic city dropdown.
  - **Server-Side URL-Driven Pagination**:
    - Synced all pagination and filter states to URL searchParams (`page`, `limit`, `tab`, `q`, `provinsi`, `kota`, `keahlian`, `kategori`, `bnsp`, `sort`, `lat`, `lng`).
    - Configured 9 items/page for Workshops (3x3 grid) and 12 items/page for Technicians (3x4 grid).
    - Added complete Swiss-design numbered pagination bar (`stories-pagination-bar`) with item range counter (`Menampilkan 1 – 9 dari 48 Bengkel Resmi`), `← Sebelumnya`, interactive page number buttons with ellipsis windowing, and `Berikutnya →`.
    - Added smooth automatic scroll to `#directory-results-top` anchor upon page transitions.
  - **Verification & Git Rollout**:
    - Ran `bun run typecheck` (0 errors across contracts, web, cms, api) and `bun test` (45/45 tests passing).
    - Committed and pushed to `dev`, merged and pushed to `staging` and `main`.


