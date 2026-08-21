#!/bin/sh
set -eu

ENV_FILE=${1:-.env.production}
COMPOSE_FILE=docker-compose.production.yml

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill every value." >&2
  exit 1
fi

for command_name in docker curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet

session_secret=$(sed -n 's/^SESSION_SECRET=//p' "$ENV_FILE" | tail -n 1)
postgres_password=$(sed -n 's/^POSTGRES_PASSWORD=//p' "$ENV_FILE" | tail -n 1)
if [ "${#session_secret}" -lt 32 ]; then
  echo "SESSION_SECRET must contain at least 32 characters." >&2
  exit 1
fi
if [ "${#postgres_password}" -lt 24 ]; then
  echo "POSTGRES_PASSWORD must contain at least 24 characters." >&2
  exit 1
fi
if ! printf '%s' "$postgres_password" | grep -Eq '^[A-Za-z0-9_-]+$'; then
  echo "POSTGRES_PASSWORD must use URL-safe characters: letters, numbers, underscore, and hyphen." >&2
  exit 1
fi
if grep -Eq 'example\.id|replace-with' "$ENV_FILE"; then
  echo "Production environment still contains placeholder values." >&2
  exit 1
fi

echo "Preflight passed for $ENV_FILE."
