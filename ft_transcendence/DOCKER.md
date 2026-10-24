# PXL_LAB local Docker deployment

## Run

Prerequisites: Docker Desktop or Docker Engine with Compose v2 supporting --wait, Make, and standard Unix tools. Start Docker first. From the repository root or ft_transcendence/: `make`.

The first run generates private settings, builds the frontend/backend, starts PostgreSQL, applies existing migrations, and starts nginx. Open https://localhost:8443. HTTP on localhost:8080 redirects to HTTPS. Only nginx is published to the host. API paths and Socket.IO use the same browser origin.

This uses a separate Compose project named pxl_lab and new named volumes. Your earlier transcendence-postgres database is not changed or imported. Register test accounts in this Docker database.

## Local HTTPS certificate

nginx creates a self-signed certificate for localhost, 127.0.0.1 and ::1. It is stored with its private key in the tls_data Docker volume, not in Git. It expires after 30 days. It is encrypted HTTPS, not a publicly trusted certificate.

For trusted Chrome testing on your Mac, export only the public certificate:

```
cd ft_transcendence
docker compose --env-file .env -f compose.yml cp web:/etc/nginx/certs/localhost.crt /tmp/pxl-localhost.crt
open /tmp/pxl-localhost.crt
```

Import it into Keychain Access, open that localhost certificate, and set SSL trust for this local certificate. Restart Chrome. This changes local trust for that certificate only. Never export or share localhost.key. A production/public domain requires its own valid certificate and configuration.

`make check` uses curl -k for a self-signed local certificate. Passing it does not establish browser trust or complete authenticated multi-user testing.

## Checks before committing

1. Run make, then make ps. database/backend/web should be healthy. The temporary migration job must finish successfully during make.
2. Run make check. Confirm frontend routes, API health, docs, avatar, HTTP redirect, unauthenticated rejection and WSS upgrade.
3. Open Chrome at https://localhost:8443 after trusting the local certificate.
4. Register accounts, edit profiles, use friends, create a community and channel.
5. Open separate browser profiles for multiple users. Verify chat, presence, typing, read receipts and notifications.
6. In DevTools Network, confirm API URLs are HTTPS and WebSocket URLs are WSS, without calls to localhost:3000.
7. Upload and read a test file. Check the Console for application errors.
8. Run make down, then make again. Confirm test accounts and uploaded files remain.

## Operations

- make logs: service logs.
- make down: stop containers, preserving named volumes.
- make ps: status.
- Re-run make after source changes to rebuild.
- Do not use docker compose down -v unless you explicitly intend to delete the Docker database, uploads and certificate.

Generated settings are in ft_transcendence/.env. Do not commit them. The sample is ft_transcendence/.env.example. Change ports there only in your local .env and run make again. Database passwords are generated as URL-safe hex. Editing them later also requires updating the existing database credentials.

New migrations are applied with prisma migrate deploy, never migrate reset or migrate dev at container startup. The migration service uses the build stage, which includes the Prisma CLI. Runtime runs as node with a persistent uploads volume.

## Verification boundary

The authoring environment has no Docker daemon, so Docker builds and runtime checks must be completed on the team laptop. Local Node builds and configuration checks are recorded separately. No moderation patch is included or invented here. Apply the supplied moderation patch separately after Docker works.
