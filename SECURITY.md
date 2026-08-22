# Security Policy

OpenOrg takes security seriously. This document outlines our vulnerability disclosure process, supported versions, and production security baseline.

---

## 🛡 Supported Versions

Security updates are actively provided for the following releases:

| Branch / Version | Supported          |
| ---------------- | ------------------ |
| `main`           | :white_check_mark: |
| `staging`        | :white_check_mark: |
| `dev`            | :white_check_mark: |

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in OpenOrg, please **do not disclose it in a public GitHub issue**.

Instead, report it privately to the maintainers:
- **Email**: Send details to `security@openorg.dev` or reach out directly to the repository maintainer on GitHub.
- **Content**: Include reproduction steps, potential impact, proof-of-concept payload, and affected components (`api`, `web`, `cms`, or `contracts`).
- **Response SLA**: Maintainers aim to acknowledge receipt of vulnerability reports within **48 hours** and provide a patch timeline within **7 days**.

---

## 🔒 Production Security Baseline

When deploying OpenOrg to a production VPS or cloud environment, adhere to the following security baseline:

1. **Secrets & Session Integrity**:
   - Generate a strong, cryptographically secure `SESSION_SECRET` (at least 32 random characters via `openssl rand -base64 32`).
   - Rotate database passwords (`POSTGRES_PASSWORD`) and never use demo/default credentials in production.
2. **Encrypted Transport (HTTPS/TLS)**:
   - Always run behind HTTPS. Caddy is provided in `docker-compose.production.yml` to automatically provision Let's Encrypt certificates.
   - Enforce HTTP Strict Transport Security (HSTS).
3. **CORS & Origin Hardening**:
   - Set exact `CMS_ORIGIN` and `WEB_ORIGIN` variables in `.env.production`. Avoid wildcard origins (`*`).
4. **Database Isolation**:
   - Ensure PostgreSQL is bound only to the internal Docker network and is not directly accessible over the public internet.
5. **Reverse Proxy Trust**:
   - Set `TRUST_PROXY=true` only when running behind a trusted reverse proxy (such as Caddy, NGINX, or Cloudflare).
6. **File Upload Protection**:
   - Restrict uploads to verified image MIME signatures and validate file sizes before saving to disk.
