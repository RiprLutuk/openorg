#!/bin/sh
set -eu

ENV_FILE=${1:-.env.production}
COMPOSE_FILE=docker-compose.production.yml

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

deployment_failed() {
  echo "Deployment failed. Recent service logs:" >&2
  compose logs --tail=120 api web cms caddy migrate >&2 || true
}
trap deployment_failed HUP INT TERM

./ops/preflight.sh "$ENV_FILE"

if compose ps --status running --services | grep -qx postgres; then
  ./ops/backup.sh "$ENV_FILE"
else
  echo "No running PostgreSQL service found; treating this as a first deployment."
fi

compose build
if ! compose up -d --wait --wait-timeout 240; then
  deployment_failed
  exit 1
fi

./ops/smoke.sh "$ENV_FILE"
trap - HUP INT TERM
echo "OpenOrg deployment completed and passed smoke tests."
