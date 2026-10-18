# PXL_LAB Backend

Backend service for the PXL_LAB ft_transcendence project.

Built with NestJS, PostgreSQL, Prisma, JWT authentication, Socket.IO, Multer, and Jest.

## Features

- JWT authentication
- User profiles, bios and skills
- Friend requests and friendships
- Community invitations by username
- Communities and memberships
- Roles and permissions
- Channels
- Posts, comments, and likes
- Moderation reports
- Realtime chat
- Presence and last seen
- Typing indicators
- Read receipts and unread counts
- User blocking
- Realtime notifications
- Search
- Avatar uploads
- Post image uploads
- Projects and tasks

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT
- Socket.IO
- Multer
- Jest
- Docker Compose

## Setup

Copy the environment example:

    cp .env.example .env

Install dependencies:

    npm install

Start PostgreSQL:

    docker compose up -d

Generate Prisma Client:

    npx prisma generate

Apply migrations:

    npx prisma migrate dev

Start the backend in development mode:

    npm run start:dev

The default API URL is:

    http://localhost:3000/api

The port can be changed with `PORT` in `.env`.

Health check:

    curl http://localhost:3000/api/health

Do not commit `.env` or real secrets.

## Environment Variables

The included `.env.example` contains:

    PORT=3000
    DATABASE_URL="postgresql://transcendence:transcendence@localhost:5432/transcendence?schema=public"
    JWT_SECRET="replace-this-with-a-long-random-secret"
    JWT_EXPIRES_IN_SECONDS=900

## Build and Tests

Run the automated tests:

    npm test -- --runInBand

Build the application:

    npm run build

Start the compiled production build:

    npm run start:prod

Useful verification commands:

    npx prisma validate
    npx prisma migrate status
    npm test -- --runInBand
    npm run build

At the Week 6 verification checkpoint:

    Test Suites: 12 passed
    Tests:       59 passed

If the incremental build output becomes stale, perform a clean build:

    rm -rf dist
    npm run build

## Authentication

Register:

    POST /api/auth/register

Login:

    POST /api/auth/login

Protected REST endpoints require:

    Authorization: Bearer ACCESS_TOKEN

Registration requirements:

- Username: 3 to 30 characters
- Username may contain letters, numbers, and underscores
- Password: 8 to 72 characters
- Password requires uppercase, lowercase, and numeric characters

## Users

    GET    /api/users/me
    PATCH  /api/users/me
    GET    /api/users/blocked
    GET    /api/users/:username
    POST   /api/users/:userId/block
    DELETE /api/users/:userId/block

Own profiles include email; public profiles omit email and password hashes. PATCH /api/users/me accepts displayName (max 50), bio (max 300), and skills (max 10, each 1–30 characters). Sending skills: [] clears the list. Empty displayName/bio clears the field. Usernames `me` and `blocked` are reserved at registration and profile update.

Blocking is respected by applicable chat, typing, read-receipt, and message-history flows. Blocking also removes friendships and pending friend requests.

## Friends

    GET    /api/friends
    GET    /api/friends/requests
    POST   /api/friends/requests
    POST   /api/friends/requests/:requestId/accept
    DELETE /api/friends/requests/:requestId
    DELETE /api/friends/:userId

Send a request with { "userId": "TARGET_UUID" }. Only the receiver may accept. Sending a request back to someone who already requested you accepts their request. Blocked pairs cannot send or accept requests.

## Invitations

    POST   /api/communities/:communityId/invitations
    GET    /api/communities/:communityId/invitations
    DELETE /api/communities/:communityId/invitations/:invitationId
    GET    /api/invitations
    POST   /api/invitations/:invitationId/accept
    POST   /api/invitations/:invitationId/decline

Invite with { "username": "hiba", "role": "MEMBER" }. Roles may be MEMBER, MODERATOR or ADMIN. Managing community invitations requires MEMBER_ADD; inviting an ADMIN requires OWNER. Only the invitee may accept/decline. Acceptance rechecks blocking and the inviter's current permission to grant the role. Private communities can be joined through an invitation.

The existing add-by-email members endpoint remains available with its existing permissions.

## Communities

    POST   /api/communities
    GET    /api/communities
    GET    /api/communities/discover
    GET    /api/communities/:communityId
    PATCH  /api/communities/:communityId
    DELETE /api/communities/:communityId
    POST   /api/communities/:communityId/join
    DELETE /api/communities/:communityId/leave

Creating a community automatically creates an `OWNER` membership.

Community roles are:

- OWNER
- ADMIN
- MODERATOR
- MEMBER

## Community Members

    GET    /api/communities/:communityId/members
    POST   /api/communities/:communityId/members
    PATCH  /api/communities/:communityId/members/:memberId/role
    DELETE /api/communities/:communityId/members/:memberId
    GET    /api/roles
    GET    /api/permissions

Community operations are protected by membership and permission checks.

## Channels

    GET    /api/communities/:communityId/channels
    POST   /api/communities/:communityId/channels
    GET    /api/channels/:channelId
    PATCH  /api/channels/:channelId
    DELETE /api/channels/:channelId

Chat uses the channel ID as the realtime room boundary while verifying community membership.

## Posts

    GET    /api/posts
    GET    /api/posts/:postId
    POST   /api/posts
    PATCH  /api/posts/:postId
    DELETE /api/posts/:postId

Posts may be global or associated with a community.

Post responses expose safe application URLs such as:

    imageUrl: /api/uploads/post/POST_ID
    avatarUrl: /api/uploads/avatar/USER_ID

Internal filesystem fields such as `imagePath` and `avatarPath` are not exposed in public post responses.

## Comments

    GET    /api/posts/:postId/comments
    POST   /api/posts/:postId/comments
    PATCH  /api/posts/:postId/comments/:commentId
    DELETE /api/posts/:postId/comments/:commentId

Comment responses also expose safe avatar URLs.

## Likes

Toggle a post like:

    POST /api/posts/:postId/likes

## Moderation Reports

    POST  /api/communities/:communityId/reports
    GET   /api/communities/:communityId/reports
    PATCH /api/communities/:communityId/reports/:reportId

Creating reports requires community access.

Viewing and reviewing reports require the corresponding moderation permissions.

Report review can generate realtime notifications.

## Messages REST API

Message history:

    GET /api/channels/:channelId/messages

Create a message:

    POST /api/channels/:channelId/messages

Unread count:

    GET /api/channels/:channelId/messages/unread-count

Users must belong to the channel's community.

Blocked-user relationships are respected by message flows.

## Socket.IO Authentication

Socket connections require a JWT.

The token can be supplied through Socket.IO auth:

    auth.token = ACCESS_TOKEN

A Bearer token in the Authorization header is also supported.

Authentication events:

    auth:success
    auth:error

Every authenticated socket also joins its private user room:

    user:USER_ID

## Realtime Channel Join

Client event:

    channel:join

Payload:

    { channelId }

Server events:

    channel:joined
    channel:error

The user must be a member of the channel's community.

## Realtime Messages

Client event:

    message:send

Payload:

    { channelId, content }

Server event:

    message:new

Error event:

    message:error

Rules:

- The socket must join the channel first
- Messages cannot be empty
- Maximum message length is 2000 characters
- Messages are persisted before being broadcast

## Typing Indicators

Client events:

    typing:start
    typing:stop

Payload:

    { channelId }

The corresponding events are broadcast to allowed users in the channel.

Blocking relationships are respected.

## Read Receipts

Client event:

    message:read

Payload:

    { channelId, messageId }

Server event:

    message:read

Read state is persisted and is used for unread message counts.

## Presence

Realtime presence events:

    presence:online
    presence:offline

The first active socket marks a user online.

The user becomes offline only after the final active socket disconnects.

When the user goes offline, `lastSeenAt` is updated.

## Notifications

REST endpoints:

    GET   /api/notifications
    PATCH /api/notifications/:notificationId/read

Realtime event:

    notification:new

Notifications are delivered through the authenticated user's private Socket.IO room.

## Search

Endpoint:

    GET /api/search

Supported search types:

- all
- users
- skills
- communities
- posts

Supported query parameters include:

- q
- type
- page
- limit
- sort
- communityId

Examples:

    GET /api/search?q=react
    GET /api/search?q=react&type=users
    GET /api/search?q=react&type=communities
    GET /api/search?q=react&type=posts
    GET /api/search?q=react&page=1&limit=10
    GET /api/search?q=react&sort=desc

Search applies privacy rules.

Public communities may appear in community search.

Private communities are visible only to their members.

Global posts can be searched.

Community posts require membership in that community.

## File Uploads

Supported formats:

- JPG
- JPEG
- PNG
- WEBP

Maximum file size:

    5 MB

Files are stored using generated UUID filenames.

### Avatar

Upload:

    POST /api/uploads/avatar

Multipart field:

    file

Read:

    GET /api/uploads/avatar/:userId

Delete:

    DELETE /api/uploads/avatar

### Post Image

Upload:

    POST /api/uploads/post/:postId

Read:

    GET /api/uploads/post/:postId

Delete:

    DELETE /api/uploads/post/:postId

Only the post author may upload or delete that post's image.

Rejected unauthorized post uploads are cleaned up so orphan files are not left on disk.

## Projects

    POST   /api/communities/:communityId/projects
    GET    /api/communities/:communityId/projects
    GET    /api/projects/:projectId
    PATCH  /api/projects/:projectId
    DELETE /api/projects/:projectId

## Tasks

    POST   /api/projects/:projectId/tasks
    GET    /api/projects/:projectId/tasks
    GET    /api/tasks/:taskId
    PATCH  /api/tasks/:taskId
    PATCH  /api/tasks/:taskId/status
    DELETE /api/tasks/:taskId

Task statuses:

- TODO
- IN_PROGRESS
- DONE
- CANCELLED

Priorities:

- LOW
- MEDIUM
- HIGH

Task listing supports pagination, search, filtering, and sorting.

## Security

The backend uses:

- JWT authentication
- DTO validation
- Request-field whitelisting
- UUID validation
- Community membership checks
- Role and permission guards
- Ownership checks
- Blocking checks
- Search privacy filtering
- Upload type validation
- Upload size validation
- Socket authentication

## Week 6 Verification

The backend has been verified with:

- Automated unit tests
- Authentication and authorization smoke tests
- Multi-user Socket.IO testing
- Realtime edge-case testing
- Search privacy testing
- Upload orphan-file cleanup testing
- Post image and avatar response integration testing
- Production build verification

Latest automated result at the Week 6 checkpoint:

    12 test suites passed
    59 tests passed

## Deployment Note

The backend listens on the configured HTTP port.

TLS/HTTPS termination should be handled by the final project deployment or reverse-proxy layer when required.

## Friends / Profiles / Invitations Integration Verification

Base: worod at bc3299c. Includes the six partner commits plus acceptance permission/block checks, reserved-username validation, and regression tests.

Verified in this integration:

- 15 Jest suites, 86 tests pass.
- Production build passes.
- Prisma schema validates.
- The supplied migration SQL matches the Prisma schema diff from the base.
- All 13 migrations apply in an isolated PGlite PostgreSQL-compatible engine; new tables/columns and community-post deletion cascade verified.

The live frontend and a running PostgreSQL server were not exercised in this environment. Before pushing, apply migrations to your development PostgreSQL database and check Friends, profile editing, invitations and notification links with the team's frontend. The PGlite check does not replace testing your real database.

Keep the supplied migration unchanged if it has already been applied elsewhere. No additional database migration is needed for the acceptance/validation fixes.

## Site Administration, Guest Access and Swagger

Site roles are separate from community roles:

| Site role | Access |
| --- | --- |
| ADMIN | Normal account features plus `/api/admin/users` management |
| USER | Existing account features, subject to community roles |
| GUEST | Authenticated read-only access, still subject to community membership/privacy |

The migration `20261017170000_add_site_roles` defaults every account to USER. Registration does not accept `siteRole`, and profile updates cannot change it. HTTP mutation requests use the current database role, not a role cached in a JWT. Chat message/read/typing writes also enforce guest restrictions. Login/register remain public. Guests are authenticated accounts, not anonymous visitors.

### First administrator

Register normally, then a local database operator can promote that existing account:

```bash
npm run admin:promote -- YOUR_USERNAME
```

This is an operator script; there is no public bootstrap/admin-registration endpoint. API role changes take effect on the next request, including requests with an existing JWT.

### Admin endpoints

All require a JWT belonging to a site ADMIN:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/admin/users?q=hiba&page=1&limit=20 | Search/paginate users (limit 1–100) |
| GET | /api/admin/users/:id | Read one user |
| POST | /api/admin/users | Create with email, username, password and optional siteRole |
| PATCH | /api/admin/users/:id | Edit email, username, displayName, bio or siteRole |
| DELETE | /api/admin/users/:id | Permanently delete the account and owned/authored content |

Passwords are hashed on creation and never returned. Administrators cannot delete/demote themselves. Serializable transactions protect against concurrent changes removing the final administrator; a conflict returns 409 and can be retried.

Deletion is permanent: owned communities, authored channels/projects/tasks/posts/comments and dependent records are removed. This may remove other users' content within those owned communities. The future frontend confirmation must explain this effect. Other accounts themselves remain. Existing sockets for a deleted account are disconnected; old REST tokens no longer authenticate. Physical uploaded files may remain for a separate storage cleanup policy.

### API documentation and avatars

Swagger UI: `/api/docs`. OpenAPI JSON: `/api/docs-json`. Use Authorize with a login JWT. This is API documentation; it does not implement the optional API-key/rate-limiting public API module.

Profiles without an upload return `avatarUrl: /api/default-avatar`. That public endpoint serves a cacheable SVG placeholder image. Avatar URLs still need the frontend's existing API-origin resolution when frontend/backend run on different origins.

### Verification and frontend handoff

Backend checks for this change: 17 suites / 110 unit tests; build; Prisma schema validation; 14 HTTP/runtime checks with a mocked Prisma provider; all 14 migrations apply in an isolated PGlite engine. A mocked-provider runtime check does not test real PostgreSQL behavior.

To test against the running development backend and its matching DATABASE_URL:

```bash
API_BASE_URL=http://localhost:3001/api npm run test:admin-api
```

That script creates temporary test accounts, promotes one through local DB access, exercises admin/guest API behavior (including deletion of a test user with owned content), and cleans up those accounts. It is intended for local development, not production. It has not been executed against your Mac/database yet.

Maram's remaining frontend work: an ADMIN-only user-management page, create/edit/delete controls with clear deletion confirmation, and read-only controls for GUEST accounts. Always enforce access server-side regardless of hidden buttons. Read `siteRole` from login or GET /api/users/me. Community role controls remain separate.

Swagger/default-avatar/backend permissions do not complete Docker/HTTPS, the final root README, the moderation UI, or other teammates' modules. OAuth and API-key public APIs are optional module choices and are not part of this change.

AI assistance was used to implement and review these backend additions and tests. Hiba still needs to review the code, validate it locally with the team frontend, and explain the authorization boundaries and deletion policy at evaluation.
