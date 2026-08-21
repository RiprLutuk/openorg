# Security policy

## Reporting

Please do not disclose suspected vulnerabilities in a public issue. Send a
private report to the repository maintainers with reproduction steps, affected
versions, and expected impact. Maintainers should acknowledge a complete report
within seven days.

## Deployment baseline

- Replace `SESSION_SECRET`, seed credentials, and database credentials.
- Serve API, CMS, and web applications through HTTPS.
- Set exact `CMS_ORIGIN` and `WEB_ORIGIN` values; do not use wildcard CORS.
- Set `TRUST_PROXY=true` only behind a trusted reverse proxy that overwrites
  forwarding headers.
- Restrict database and upload storage access and maintain tested backups.
- Review role permissions, audit logs, dependency updates, and inactive users.
- Do not expose demo data or demo credentials in production.

Supported security fixes target the latest release on the main branch.
