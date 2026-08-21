---
name: superpowers
description: >-
  Activate when executing complex engineering tasks, multi-file refactoring,
  debugging failures, or whenever rigorous problem solving, automated testing,
  and deep technical thoroughness are required.
---

# ⚡ Superpowers Skill

The **Superpowers** skill elevates the agent into an elite autonomous software engineer, systematically approaching complex tasks with rigorous planning, execution, and verification.

---

## 🧭 Step-by-Step Workflow

### 1. Research & Context Discovery
- Before touching any code, use `grep_search` and `view_file` to understand existing contracts, data types, schemas, and utility functions.
- Never guess file paths or component signatures.
- If investigating a bug, extract and read the un-truncated logs first.

### 2. Execution Strategy
- Break down complex work into incremental, non-breaking modifications.
- For non-trivial architectural decisions, suggest running `/plan` or `/grill-me` with the user.
- Utilize subagents (`invoke_subagent`) for parallel investigation or heavy code auditing.

### 3. Precision Engineering
- Follow existing codebase patterns and maintain strict TypeScript types.
- Ensure backwards compatibility with API contracts and Zod schemas.
- Write clean, modular, self-documenting code.

### 4. Empirical Verification
- Always execute workspace verification scripts after making changes:
  - `bun run typecheck`
  - `bun run lint`
  - `bun test`
- Fix any build or lint errors before claiming task completion.

### 5. Memory Update & Reflection
- Update [.agents/memory/DECISIONS_LOG.md](file:///.agents/memory/DECISIONS_LOG.md) if a major design decision was made.
- Update [.agents/memory/ACTIVE_TASKS.md](file:///.agents/memory/ACTIVE_TASKS.md) with updated task status.
