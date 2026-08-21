# OpenOrg production go-live

The production stack serves three HTTPS hosts through Caddy:

- `WEB_DOMAIN`: public website and same-origin member API proxy
- `CMS_DOMAIN`: administration studio
- `API_DOMAIN`: API used by the CMS and integrations

PostgreSQL and application containers are isolated on the private Docker network. The production deployment never runs the demo seed.

## 1. Infrastructure and DNS

Provision a Linux server with Docker Engine and the Compose plugin. Allow inbound TCP 80/443 and UDP 443; do not expose PostgreSQL or application ports. Create A/AAAA records for all three domains pointing to the server. Reverse DNS is not required for the web stack.

Copy `.env.production.example` to `.env.production`, replace every placeholder, and generate secrets with a cryptographically secure password manager. The public organization slug must already exist in the database.
Use only URL-safe letters, numbers, underscores, and hyphens in `POSTGRES_PASSWORD`, because the value is also embedded in the PostgreSQL connection URL.

```sh
./ops/preflight.sh .env.production
```

## 2. First deployment

Before the first production start, restore an approved database snapshot or start with an empty database and run migrations. Never run `db:seed` against production.

```sh
./ops/deploy.sh .env.production
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

The one-shot `migrate` service must exit with code 0. The API readiness endpoint verifies PostgreSQL connectivity; liveness only verifies the process.

## 3. Release procedure

1. Run `bun run typecheck`, `bun run lint`, `bun run test`, and `bun run build` in CI.
2. Run `./ops/backup.sh .env.production`; copy both the database and media archives to encrypted off-server storage.
3. Build the new images, then run `docker compose ... up -d`.
4. Confirm the migration job, container health, and `./ops/smoke.sh`.
5. Check public join, member login, CMS login, one page update, and audit-log creation.

For rollback, redeploy the previous immutable image revision. Restore the database only when a migration/data change is incompatible; restoring discards newer production data and therefore requires explicit confirmation.

```sh
./ops/restore.sh .env.production backups/openorg-TIMESTAMP.sql.gz --confirm-restore
./ops/restore-media.sh .env.production backups/openorg-media-TIMESTAMP.tar.gz --confirm-restore
```

## 4. Backup and monitoring policy

- Run encrypted PostgreSQL and media-volume backups daily, retaining 7 daily and 4 weekly copies off-server.
- Test restoration into an isolated database at least monthly; a backup is not proven until restored.
- Monitor `/health/live`, `/health/ready`, TLS expiry, HTTP 5xx rate, disk usage, database volume, and backup age.
- Alert on repeated authentication failures and sudden rate-limit bans.
- Rotate database/session secrets after staff access changes and at least annually.

## 5. Product acceptance before launch

- Verify the primary custom domain in the organization domain table.
- Set the final dynamic color palette, logo, favicon, footer, navigation, contact channels, and homepage SEO in CMS.
- Upload cover images from the story/event editors; uploaded PNG, JPEG, WebP, and GIF assets are signature-validated and stored in the persistent media volume.
- Publish legal pages: privacy notice, terms/member agreement, data retention, and complaint/contact procedure.
- Validate membership application, approval, member login, card print, credential verification, learning credits, invoice/payment state, governance workflow, and audit trail with production-like accounts.
- Configure an external transactional email provider, object storage, and payment/WhatsApp adapters before enabling workflows that promise those deliveries. Local uploads are persistent but are not a substitute for off-server object storage.

## 6. Security operations

API documentation is disabled in production. Cookies are secure and HTTP-only in production; member traffic uses the public site's `/api` proxy so the browser does not depend on third-party cookies. Caddy terminates TLS and adds HSTS. Keep Docker, PostgreSQL, Caddy, Bun, and application dependencies patched through tested release revisions.
