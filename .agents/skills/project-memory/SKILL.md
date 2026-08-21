---
name: project-memory
description: >-
  Activate to recall, record, search, or update project memory, architecture
  notes, tech stack details, decisions log, and task history across sessions.
---

# 🧠 Project Memory Skill

The **Project Memory** skill maintains persistent knowledge about the codebase architecture, environment requirements, technology choices, ongoing tasks, and historical decisions across developer and agent sessions.

---

## 📂 Memory Store Files

All memory is stored in human-readable Markdown files inside `.agents/memory/`:

1. **[PROJECT_CONTEXT.md](file:///.agents/memory/PROJECT_CONTEXT.md)**: High-level overview of the application architecture, tech stack, database schemas, environment variables, scripts, and conventions.
2. **[DECISIONS_LOG.md](file:///.agents/memory/DECISIONS_LOG.md)**: Dated log of architectural decisions, technology choices, API designs, and design system choices.
3. **[ACTIVE_TASKS.md](file:///.agents/memory/ACTIVE_TASKS.md)**: Live tracking of ongoing features, backlog items, completed milestones, and known issues.

---

## 🔄 Memory Lifecycle & Protocols

### Reading Memory
- When starting work on a new feature or debugging session, view [.agents/memory/PROJECT_CONTEXT.md](file:///.agents/memory/PROJECT_CONTEXT.md) and [.agents/memory/ACTIVE_TASKS.md](file:///.agents/memory/ACTIVE_TASKS.md).

### Updating Memory
- **After major feature completion**: Update [.agents/memory/ACTIVE_TASKS.md](file:///.agents/memory/ACTIVE_TASKS.md) to mark tasks completed.
- **After architectural or tech stack decisions**: Append a new entry to [.agents/memory/DECISIONS_LOG.md](file:///.agents/memory/DECISIONS_LOG.md) detailing context, decision, and rationale.
- **When user clarifies setup instructions**: Update [.agents/memory/PROJECT_CONTEXT.md](file:///.agents/memory/PROJECT_CONTEXT.md) and recommend `/learn` if applicable.
