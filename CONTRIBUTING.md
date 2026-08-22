# Contributing to OpenOrg

Thank you for your interest in contributing to **OpenOrg**! We welcome contributions from developers, designers, and organizations looking to build high-performance, member-driven organizational systems.

---

## 🧭 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please treat all contributors and maintainers with respect, professionalism, and empathy.

---

## 🛠 Getting Started

### Prerequisites
- **Bun** (v1.3+ recommended)
- **PostgreSQL** (v15+)
- **Git**

### Local Setup
1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/your-username/openorg.git
   cd openorg
   ```
2. **Install dependencies**:
   ```bash
   bun install --frozen-lockfile
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
4. **Database setup**:
   ```bash
   bun run db:migrate
   bun run db:seed
   ```
5. **Start development servers**:
   ```bash
   bun run dev
   ```

---

## 🌿 Branching Strategy & Git Workflow

- **`main`**: Production-ready, stable releases.
- **`staging`**: Pre-production integration branch for testing and release candidate verification.
- **`dev`**: Active development branch where new feature branches are merged.

### Creating a Feature Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name
```

### Commit Message Conventions (Conventional Commits)
We enforce clear, standardized commit messages:
- `feat(scope): add new feature`
- `fix(scope): resolve issue or bug`
- `docs(scope): update documentation or README`
- `style(scope): format code or adjust UI aesthetics`
- `refactor(scope): code reorganization without feature change`
- `test(scope): add or fix unit/integration tests`
- `chore(scope): updates to build configuration or dependencies`

---

## 🚦 Quality Gates & Verification

Before submitting a Pull Request, verify that all quality gates pass with zero errors:

```bash
# 1. Typecheck all packages & apps
bun run typecheck

# 2. Biome linter & formatting check
bun run lint

# 3. Automated test suite
bun test

# 4. Monorepo production build
bun run --filter '*' build
```

---

## 🔒 Security Best Practices

- **Never commit credentials**: Avoid committing `.env`, API keys, private tokens, or customer data.
- **Sanitization**: Ensure all rich content inputs are sanitized using the built-in HTML/text sanitizers.
- **Validation**: All API endpoints must enforce strict Zod schema validation.

---

## 📬 Submitting a Pull Request (PR)

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request targeting the **`dev`** branch on `RiprLutuk/openorg`.
3. Fill out the PR description with:
   - Summary of changes and rationale.
   - Screenshot / preview if UI changes are involved.
   - Confirmation that all quality gates (`typecheck`, `lint`, `test`, `build`) have passed.
