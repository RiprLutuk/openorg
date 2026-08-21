# Contributing

Thank you for helping improve OpenOrg.

1. Create a focused branch and keep unrelated changes out of the commit.
2. Install with `bun install --frozen-lockfile`.
3. Add or update tests for behavioral changes.
4. Run `bun run lint`, `bun run typecheck`, `bun run test`, and
   `bun run build` before opening a pull request.
5. Describe migrations, security impact, tenant-isolation impact, and visual
   changes in the pull request.

Never commit `.env`, production credentials, personal member data, uploaded
files, or database exports. New tenant-owned tables and routes must constrain
reads and writes by `organizationId` and use the existing authorization and
audit helpers.
