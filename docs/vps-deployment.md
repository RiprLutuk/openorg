# OpenOrg VPS Deployment Guide 🚀

This guide provides a comprehensive, production-ready walk-through for deploying OpenOrg onto any Linux VPS (Ubuntu 22.04 / 24.04 LTS, Debian 12, etc.) using Docker Compose and automatic TLS termination via Caddy.

---

## 🏗 Architecture Overview

```text
                                Internet
                                   │
                     ┌─────────────┴─────────────┐
                     │ DNS: Port 80 / 443 (HTTPS) │
                     └─────────────┬─────────────┘
                                   ▼
                      [ Caddy Reverse Proxy & TLS ]
             (Automated Let's Encrypt / ZeroSSL Certificates)
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
 [ Next.js Web ]             [ React CMS ]               [ Fastify API ]
  (Port 3000)                  (Port 80)                   (Port 4000)
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   ▼
                        [ PostgreSQL Database ]
                         (Internal Docker Net)
```

---

## 📋 Prerequisites

1. **VPS Specifications**:
   - Minimum: 1 vCPU, 2 GB RAM, 20 GB SSD.
   - Recommended: 2 vCPU, 4 GB RAM, 40 GB SSD.
2. **Domain Names (DNS A Records)**:
   Point the following records to your VPS Public IP:
   - `yourdomain.com` (or `org.yourdomain.com`) ➔ Public Website (`WEB_DOMAIN`)
   - `cms.yourdomain.com` ➔ Admin CMS Studio (`CMS_DOMAIN`)
   - `api.yourdomain.com` ➔ REST API Server (`API_DOMAIN`)

---

## 🛠 Step 1: Server Initial Setup

SSH into your VPS and update packages:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban
```

### Configure Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 🐳 Step 2: Install Docker & Docker Compose

Install Docker using the official Docker setup script:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and log back in, then verify:

```bash
docker --version
docker compose version
```

---

## 📦 Step 3: Clone Repository & Configure Environment

Clone your repository to `/opt/openorg` or your preferred directory:

```bash
sudo mkdir -p /opt/openorg
sudo chown -R $USER:$USER /opt/openorg
git clone https://github.com/RiprLutuk/openorg.git /opt/openorg
cd /opt/openorg
```

Create `.env.production` from the template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your real production values:

```bash
nano .env.production
```

Key fields to configure:
- `POSTGRES_PASSWORD`: Generate a strong random password (e.g. `openssl rand -hex 16`)
- `WEB_DOMAIN`: `yourdomain.com`
- `CMS_DOMAIN`: `cms.yourdomain.com`
- `API_DOMAIN`: `api.yourdomain.com`
- `TLS_EMAIL`: `admin@yourdomain.com` (for SSL alerts and registration)
- `SESSION_SECRET`: Generate a 32+ character random string (e.g. `openssl rand -base64 32`)

---

## 🚀 Step 4: Deploy with Automated Ops Script

OpenOrg includes built-in operational scripts to handle preflight validation, database backup, building images, running migrations, and health check verifications.

Run the deployment script:

```bash
./ops/deploy.sh .env.production
```

Or deploy manually via Docker Compose:

```bash
# Build and run containers in background
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

---

## 👤 Step 5: Initial Database Seeding (First-Time Only)

Once the database and API containers are running, execute initial seed data for your organization:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml exec api bun run db:seed
```

Now you can log into the Admin CMS Studio at `https://cms.yourdomain.com` using the credentials configured in `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

---

## 🔄 Step 6: Updates & Continuous Deployment

To deploy new updates in the future:

```bash
cd /opt/openorg
git pull origin main
./ops/deploy.sh .env.production
```

The `deploy.sh` script automatically:
1. Performs an automatic snapshot backup of PostgreSQL before upgrading.
2. Re-builds images with the latest code.
3. Applies any pending database migrations.
4. Performs smoke testing to guarantee zero-downtime health.

---

## 💾 Step 7: Automated Daily Backups

Set up an automated cron job to back up the database daily:

```bash
crontab -e
```

Add the following line (runs every midnight at 00:00):

```cron
0 0 * * * cd /opt/openorg && ./ops/backup.sh .env.production >> /var/log/openorg-backup.log 2>&1
```

---

## 🩺 Useful Operational Commands

- **View real-time logs**:
  ```bash
  docker compose --env-file .env.production -f docker-compose.production.yml logs -f
  ```
- **Restart services**:
  ```bash
  docker compose --env-file .env.production -f docker-compose.production.yml restart
  ```
- **Inspect running containers**:
  ```bash
  docker compose --env-file .env.production -f docker-compose.production.yml ps
  ```
- **Restore database from backup**:
  ```bash
  ./ops/restore.sh .env.production /path/to/backup.sql.gz
  ```
