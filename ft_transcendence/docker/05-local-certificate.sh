#!/bin/sh
set -eu
mkdir -p /etc/nginx/certs
if [ ! -s /etc/nginx/certs/localhost.crt ] || [ ! -s /etc/nginx/certs/localhost.key ]; then
  umask 077
  openssl req -x509 -newkey rsa:2048 -nodes -days 30 \
    -keyout /etc/nginx/certs/localhost.key \
    -out /etc/nginx/certs/localhost.crt \
    -subj /CN=localhost \
    -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1'
fi
