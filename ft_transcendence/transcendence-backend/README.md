# Transcendence Backend

NestJS REST API using PostgreSQL, Prisma, JWT authentication, and role-based
community permissions.

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The API is available at `http://localhost:3000/api`. Verify it with:

```bash
curl http://localhost:3000/api/health
```

Never commit `.env`. Replace the example JWT secret before starting the API.

## Verification

```bash
npx prisma validate
npm run build
npm test -- --runInBand
npx prisma migrate status
```

## Authentication and users

```http
POST  /api/auth/register
POST  /api/auth/login
GET   /api/users/me
PATCH /api/users/me
```

Protected requests require `Authorization: Bearer ACCESS_TOKEN`.

## Communities

```http
POST   /api/communities
GET    /api/communities
GET    /api/communities/discover
GET    /api/communities/:communityId
PATCH  /api/communities/:communityId
DELETE /api/communities/:communityId
POST   /api/communities/:communityId/join
DELETE /api/communities/:communityId/leave
```

Create or update payload:

```json
{
  "name": "Transcendence Team",
  "description": "Main development community",
  "isPublic": true
}
```

Creating a community automatically creates an `OWNER` membership. Discover
returns public communities the current user has not joined. Public communities
can be joined directly. An owner cannot leave; ownership must be transferred or
the community must be deleted.

## Members and roles

```http
GET    /api/communities/:communityId/members
POST   /api/communities/:communityId/members
PATCH  /api/communities/:communityId/members/:memberId/role
DELETE /api/communities/:communityId/members/:memberId
GET    /api/roles
GET    /api/permissions
```

Add a registered user:

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

Roles are `OWNER`, `ADMIN`, `MODERATOR`, and `MEMBER`. Only an owner can assign,
change, or remove an administrator. Owners cannot be demoted or removed.
Moderators can remove ordinary members but cannot manage owners, admins, or
other moderators.

## Channels

```http
GET    /api/communities/:communityId/channels
POST   /api/communities/:communityId/channels
GET    /api/channels/:channelId
PATCH  /api/channels/:channelId
DELETE /api/channels/:channelId
```

Create a channel:

```json
{
  "name": "general",
  "description": "General discussion",
  "type": "TEXT"
}
```

Channel names are unique inside a community. Members can read channels. Owners,
admins, and moderators can create and update channels; only owners and admins
can delete them. Worod's chat implementation can reference `channelId` while
using community membership as its access boundary.

## Projects and tasks

```http
POST   /api/communities/:communityId/projects
GET    /api/communities/:communityId/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId

POST   /api/projects/:projectId/tasks
GET    /api/projects/:projectId/tasks
GET    /api/tasks/:taskId
PATCH  /api/tasks/:taskId
PATCH  /api/tasks/:taskId/status
DELETE /api/tasks/:taskId
```

Task statuses are `TODO`, `IN_PROGRESS`, `DONE`, and `CANCELLED`. Priorities are
`LOW`, `MEDIUM`, and `HIGH`. An assignee must belong to the parent community.

Task lists support pagination, search, status, priority, assignee, and sorting:

```http
GET /api/projects/:projectId/tasks?page=1&limit=10
GET /api/projects/:projectId/tasks?status=DONE&priority=HIGH
GET /api/projects/:projectId/tasks?search=authentication
GET /api/projects/:projectId/tasks?sortBy=dueDate&sortOrder=asc
```

## Database compatibility

The Prisma names are now `Community`, `CommunityMember`, and `communityId`.
They map to the existing PostgreSQL `groups`, `members`, and `groupId` names so
the refactor does not erase existing development data. Apply the included
`add_communities_and_channels` migration; do not reset a shared database.
