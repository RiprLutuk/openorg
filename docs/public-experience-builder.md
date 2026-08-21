# Public Experience Builder

The public site is assembled from validated CMS section data and inherits the organization's live theme tokens. No homepage color or content is tied to an organization-specific stylesheet.

## Rich homepage composition

The demo homepage combines nine reusable blocks: a hero and configurable workspace panel, proof metrics, platform capabilities, rich legal/trust narrative, member journey, editorial feed, event feed, public governance structure, and conversion CTA.

Hero panel highlights and proof points, feature variants and items, statistics, content-feed source and limit, organization-chart depth, CTA links, and contact options can all be changed in the page builder. Feature layouts support regular cards, platform modules, and numbered journey steps without changing application code.

## Theme behavior

Public components use `--color-primary`, `--color-secondary`, `--color-accent`, `--color-surface`, `--color-foreground`, the configured fonts, and the configured radius. Color mixtures are derived from those tokens, allowing the CMS palette to change the entire experience coherently.

## Content safety

Every section is parsed by `pageSectionsSchema`. Public URLs accept only safe relative, anchor, HTTP(S), mail, and telephone targets. Rich HTML continues through the API sanitizer before publication.
