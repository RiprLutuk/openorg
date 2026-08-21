#!/bin/sh
set -eu

ENV_FILE=${1:-.env.production}
BACKUP_DIR=${2:-backups}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
TARGET="$BACKUP_DIR/openorg-$STAMP.sql.gz"
MEDIA_TARGET="$BACKUP_DIR/openorg-media-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"
docker compose --env-file "$ENV_FILE" -f docker-compose.production.yml exec -T postgres \
  sh -c 'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip -9 > "$TARGET"

gzip -t "$TARGET"
docker compose --env-file "$ENV_FILE" -f docker-compose.production.yml exec -T api \
  tar -czf - -C /app/apps/api uploads > "$MEDIA_TARGET"
tar -tzf "$MEDIA_TARGET" >/dev/null
echo "Database backup written and verified: $TARGET"
echo "Media backup written and verified: $MEDIA_TARGET"
