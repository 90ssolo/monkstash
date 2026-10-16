#!/bin/sh
# Tells IndexNow search engines (Bing, Yandex, Seznam, Naver and others) about every page in
# the live sitemap. Run after a deploy that adds or changes pages:
#   sh deploy/indexnow.sh
# The key file apps/web/public/<key>.txt must be live on the site first.
set -eu
SITE="${SITE:-https://monkstash.com}"
KEY="${INDEXNOW_KEY:-8ff9b28fc681e1708bc419457dc505f8}"
HOST=$(printf '%s' "$SITE" | sed 's#^https\?://##; s#/.*##')

urls=$(curl -fsS "$SITE/sitemap.xml" | grep -o '<loc>[^<]*' | sed 's#<loc>##' | sed 's#.*#"&"#' | paste -sd, -)
[ -n "$urls" ] || { echo "No URLs found in $SITE/sitemap.xml"; exit 1; }
count=$(printf '%s\n' "$urls" | tr ',' '\n' | grep -c .)

body=$(printf '{"host":"%s","key":"%s","keyLocation":"%s/%s.txt","urlList":[%s]}' "$HOST" "$KEY" "$SITE" "$KEY" "$urls")
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' --data-binary "$body")
echo "Submitted $count URLs to IndexNow: HTTP $code (200 or 202 means accepted)"
