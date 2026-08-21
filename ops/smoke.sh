#!/bin/sh
set -eu

ENV_FILE=${1:-.env.production}
WEB_DOMAIN=$(sed -n 's/^WEB_DOMAIN=//p' "$ENV_FILE" | tail -n 1)
CMS_DOMAIN=$(sed -n 's/^CMS_DOMAIN=//p' "$ENV_FILE" | tail -n 1)
API_DOMAIN=$(sed -n 's/^API_DOMAIN=//p' "$ENV_FILE" | tail -n 1)
ORG_SLUG=$(sed -n 's/^DEFAULT_ORGANIZATION_SLUG=//p' "$ENV_FILE" | tail -n 1)

check() {
  url=$1
  expected=$2
  status=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "$url")
  if [ "$status" != "$expected" ]; then
    echo "FAILED $url: expected $expected, received $status" >&2
    exit 1
  fi
  echo "OK $status $url"
}

check "https://$API_DOMAIN/health/live" 200
check "https://$API_DOMAIN/health/ready" 200
check "https://$API_DOMAIN/v1/public/site" 200
check "https://$API_DOMAIN/documentation" 404
check "https://$WEB_DOMAIN/" 200
check "https://$WEB_DOMAIN/stories" 200
check "https://$WEB_DOMAIN/events" 200
check "https://$WEB_DOMAIN/robots.txt" 200
check "https://$WEB_DOMAIN/sitemap.xml" 200
check "https://$WEB_DOMAIN/icon.svg" 200
check "https://$WEB_DOMAIN/member/login" 200
check "https://$CMS_DOMAIN/" 200

if curl --silent --show-error --fail \
  -H "X-Organization: $ORG_SLUG" \
  "https://$API_DOMAIN/v1/public/site" >/dev/null; then
  echo "Tenant header check passed."
fi
