# Transcendence Backend

Core REST API built with NestJS, PostgreSQL, and Prisma.

## First setup

```bash
cp .env.example .env
npm install
docker compose up -d
npx prisma generate
npx prisma migrate dev --name init_users
npm run start:dev
```

Then open `http://localhost:3000/api/health`.

Expected response:

```json
{
  "status": "ok",
  "service": "transcendence-backend",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Useful commands

```bash
npm run start:dev
npm run build
npm test
npx prisma studio
```

## Current milestone

- NestJS application foundation
- Environment configuration
- Global request validation
- PostgreSQL development container
- Prisma database connection
- Initial `User` table
- Health-check endpoint

## Authentication endpoints

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "heba@example.com",
  "username": "heba",
  "password": "StrongPass123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "heba@example.com",
  "password": "StrongPass123"
}
```

### Current user

```http
GET /api/users/me
PATCH /api/users/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Current milestone

- NestJS application foundation
- PostgreSQL and Prisma connection
- Registration with validation and password hashing
- Login with JWT access token
- JWT-protected current-user endpoint
- Group creation with automatic owner membership
- Private group listing and group details
- Member listing and owner/admin member addition

## Groups and members

All routes require `Authorization: Bearer ACCESS_TOKEN`.

```http
POST /api/groups
{
  "name": "Backend Team",
  "description": "Core API development"
}
```

```http
GET /api/groups
GET /api/groups/GROUP_UUID
PATCH /api/groups/GROUP_UUID
DELETE /api/groups/GROUP_UUID
GET /api/groups/GROUP_UUID/members
```

The user added as a member must already have a registered account:

```http
POST /api/groups/GROUP_UUID/members
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

## Roles and permissions

```http
GET /api/roles
GET /api/permissions
PATCH /api/groups/GROUP_UUID/members/MEMBER_UUID/role
DELETE /api/groups/GROUP_UUID/members/MEMBER_UUID
```

The fixed roles are `OWNER`, `ADMIN`, and `MEMBER`. A reusable group permission
guard reads the current membership and verifies the permissions required by an
endpoint. Only an owner can change another member's role. Owners cannot be
demoted or removed.

## Projects and tasks

Projects belong to groups, and tasks belong to projects. Authorization is still
based on the user's membership in the parent group.

```http
POST   /api/groups/GROUP_UUID/projects
GET    /api/groups/GROUP_UUID/projects
GET    /api/projects/PROJECT_UUID
PATCH  /api/projects/PROJECT_UUID
DELETE /api/projects/PROJECT_UUID

POST   /api/projects/PROJECT_UUID/tasks
GET    /api/projects/PROJECT_UUID/tasks
GET    /api/tasks/TASK_UUID
PATCH  /api/tasks/TASK_UUID
PATCH  /api/tasks/TASK_UUID/status
DELETE /api/tasks/TASK_UUID
```

Task statuses are `TODO`, `IN_PROGRESS`, `DONE`, and `CANCELLED`. Priorities are
`LOW`, `MEDIUM`, and `HIGH`. An assignee is optional, but must be a member of the
project's group.

### Task filtering and pagination

The project task list accepts validated query parameters:

```http
GET /api/projects/PROJECT_UUID/tasks?page=1&limit=10
GET /api/projects/PROJECT_UUID/tasks?status=DONE&priority=HIGH
GET /api/projects/PROJECT_UUID/tasks?assigneeId=USER_UUID
GET /api/projects/PROJECT_UUID/tasks?search=authentication
GET /api/projects/PROJECT_UUID/tasks?sortBy=dueDate&sortOrder=asc
```

`page` starts at 1 and `limit` is capped at 100. Valid sort fields are
`createdAt`, `dueDate`, and `title`. The response contains `data` and a `meta`
object with `page`, `limit`, `total`, and `totalPages`.

## Completed backend scope

- Authentication: registration, login, password hashing, JWT verification
- Users: safe current profile and email/username updates
- Groups: create, list, read, update, and owner-only delete
- Members: list, add, change role, and remove
- Roles and permissions: fixed role matrix and reusable permission guard
- Projects: create, list, read, update, and delete
- Tasks: create, list, read, update, status update, and delete
- Task queries: pagination, filters, text search, and sorting
- Validation: strict DTO validation and unknown-field rejection
- Database: PostgreSQL relations, constraints, indexes, and cascades
- Verification: TypeScript build and automated service/guard tests
