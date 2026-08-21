# Organization and brand customization

## Theme flow

Theme values live in the `organizations.theme` JSONB column and are validated by
the shared `@openorg/contracts` package. The CMS updates them through
`PATCH /v1/admin/organization`; the public API returns them from
`GET /v1/public/site`.

The public website maps the five colors, fonts, and radius setting to CSS custom
properties. A saved CMS change therefore reaches server-rendered pages without
changing application source code.

The accepted theme shape is:

```json
{
  "colors": {
    "primary": "#3b5bdb",
    "secondary": "#182230",
    "accent": "#f97066",
    "surface": "#f8fafc",
    "foreground": "#101828"
  },
  "radius": "large",
  "fontHeading": "Manrope",
  "fontBody": "Inter"
}
```

All color values must be six-digit hexadecimal colors. CMS permissions
`settings.read` and `settings.write` control access.

## Adding an organization

An organization needs:

1. An `organizations` row with a unique slug and valid theme.
2. At least one owner user with role and permission assignments.
3. Optional `domains` rows for public and CMS hostnames.
4. Navigation, pages, forms, and other content owned by the same organization.

For local development, clients send `X-Organization: <slug>`. For deployed
custom domains, the API resolves the hostname from the `domains` table. Do not
use a user-supplied organization ID directly in database queries.

## Adapting organization types

- Use organization units and parent relationships for chapters, branches,
  departments, shelters, or regional teams.
- Use member `customFields` for sector-specific profile data without schema
  changes.
- Use page blocks for hero, rich text, features, statistics, feeds,
  organization charts, calls to action, and contact sections.
- Use form definitions to accept contact messages or applications; submissions
  appear in the shared CMS Inbox workflow.

## Cache behavior

Public API reads are server-rendered and use a short revalidation window. A
saved theme can take up to 60 seconds to appear on an already cached page. New
requests or a web process restart will use the persisted theme immediately.
