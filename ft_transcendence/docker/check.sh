#!/bin/sh
set -eu
http_port=$(sed -n 's/^HTTP_PORT=//p' .env)
https_port=$(sed -n 's/^HTTPS_PORT=//p' .env)
base="https://localhost:${https_port:-8443}"
printf 'Checking local HTTPS using the self-signed certificate.\n'
for path in / /friends /api/health /api/docs-json /api/default-avatar; do
  code=$(curl --max-time 15 -k -sS -o /dev/null -w '%{http_code}' "$base$path")
  [ "$code" = 200 ] || { echo "FAIL $path returned $code"; exit 1; }
  echo "PASS HTTPS $path"
done
code=$(curl --max-time 15 -sS -o /dev/null -w '%{http_code}' "http://localhost:${http_port:-8080}/api/health")
[ "$code" = 308 ] || { echo "FAIL HTTP redirect returned $code"; exit 1; }
echo 'PASS HTTP redirect'
code=$(curl --max-time 15 -k -sS -o /dev/null -w '%{http_code}' "$base/api/users/me")
[ "$code" = 401 ] || { echo "FAIL unauthenticated profile returned $code"; exit 1; }
echo 'PASS protected API'
code=$(curl --http1.1 -k -s --max-time 2 -o /dev/null -w '%{http_code}' \
  -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
  "$base/socket.io/?EIO=4&transport=websocket" 2>/dev/null || true)
[ "$code" = 101 ] || { echo "FAIL WSS upgrade returned $code"; exit 1; }
echo 'PASS WSS upgrade (authenticated chat still needs browser testing)'
echo 'Basic deployment checks passed. Complete the browser checklist in DOCKER.md.'
