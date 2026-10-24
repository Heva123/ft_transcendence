#!/bin/sh
set -eu
if [ -f .env ]; then
  exit 0
fi
umask 077
password=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')
secret=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')
cat > .env <<EOF
POSTGRES_USER=pxl_lab
POSTGRES_DB=pxl_lab
POSTGRES_PASSWORD=$password
JWT_SECRET=$secret
JWT_EXPIRES_IN_SECONDS=900
HTTP_PORT=8080
HTTPS_PORT=8443
EOF
printf 'Created private Docker settings in ft_transcendence/.env\n'
