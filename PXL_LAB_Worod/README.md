# PXL_LAB Backend

Backend work for the PXL_LAB project using NestJS, Socket.IO, PostgreSQL and Prisma.

## Features

- Socket.IO connection and broadcasting
- Posts CRUD
- Comments and replies
- Likes
- Global and community feeds
- Pagination and validation

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:setup
npm run start:dev
```

Server: `http://127.0.0.1:3000`

Test pages:
- `/demo.html`
- `/feed-demo.html`

## Tests

```bash
npm run test:socket
npm run test:api
```
