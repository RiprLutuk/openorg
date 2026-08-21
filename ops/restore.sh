#!/bin/sh
set -eu

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 ENV_FILE BACKUP.sql.gz --confirm-restore" >&2
  exit 1
fi

ENV_FILE=$1
BACKUP_FILE=$2
CONFIRMATION=${3:-}

if [ "$CONFIRMATION" != "--confirm-restore" ]; then
  echo "Restore replaces current database objects. Re-run with --confirm-restore." >&2
  exit 1
fi
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup not found: $BACKUP_FILE" >&2
  exit 1
fi

gzip -t "$BACKUP_FILE"
gzip -dc "$BACKUP_FILE" | docker compose --env-file "$ENV_FILE" \
  -f docker-compose.production.yml exec -T postgres \
  sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" "$POSTGRES_DB"'

echo "Restore completed from $BACKUP_FILE"
