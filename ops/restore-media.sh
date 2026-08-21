#!/bin/sh
set -eu

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 ENV_FILE MEDIA_BACKUP.tar.gz --confirm-restore" >&2
  exit 1
fi

ENV_FILE=$1
BACKUP_FILE=$2
CONFIRMATION=${3:-}
COMPOSE_FILE=docker-compose.production.yml

if [ "$CONFIRMATION" != "--confirm-restore" ]; then
  echo "Media restore overwrites files with matching names. Re-run with --confirm-restore." >&2
  exit 1
fi
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Media backup not found: $BACKUP_FILE" >&2
  exit 1
fi

tar -tzf "$BACKUP_FILE" >/dev/null
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop api
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --no-deps -T api \
  sh -c 'mkdir -p /app/apps/api/uploads && tar -xzf - -C /app/apps/api' < "$BACKUP_FILE"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d api

echo "Media restore completed from $BACKUP_FILE"
