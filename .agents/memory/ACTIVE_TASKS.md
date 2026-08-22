# Active Tasks & Roadmap Tracker

---

## 🚀 Active Sprint / Tasks
- [x] Configure agent superpowers, UI/UX design skill, and project memory system.
- [x] Refactor architecture from multi-tenant platform to single-tenant standalone organization web application & company profile.
- [x] Update database schema (`site_settings` single-row table, removed `organization_id` from all tables).
- [x] Refactor API plugins & route handlers (`apps/api/src/routes/`): `public`, `auth`, `admin`, `credentials`, `governance`, `learning`, `media`, `membership`, `revenue`.
- [x] Update contracts (`packages/contracts`) & web/CMS clients (`apps/web`, `apps/cms`), removing `X-Organization` header dependencies.
- [x] Execute single-tenant database migration & seeding (`bun run db:seed`).
- [x] Run full empirical verification (`bun run typecheck`, `bun run lint:fix`, `bun test`, `bun run build`).
- [x] Push all 3 primary branches (`main`, `staging`, `dev`) to GitHub remote (`https://github.com/RiprLutuk/openorg.git`).
- [x] Replace text action buttons in CMS table rows with clean icon buttons (`CreditCard`, `Pencil`, `Trash2`) and tooltips.
- [x] Implement reusable `SearchableSelect` combobox with live search filtering for form dropdowns.
- [x] Add dynamic Header Navigation Menu manager in CMS Settings.
- [x] Eliminate font reload glitches via Google Fonts preloading.
- [x] Fix sidebar workspace switcher avatar flexing distortion & interactive popover menu.
- [x] Replace all raw JSON textareas across CMS (Footer Links, Custom Fields, Social Links) with clean interactive visual form builders.
- [x] Refactor web navigation with Enterprise Top Utility Bar & zero-shift pure CSS sticky header (`top: -36px`).

---

## 📌 Backlog / Feature Pipeline
- [ ] Expand member self-service features in portal (`/member`).
- [ ] Add PDF certificate generation for completed Academy SKP activities.
