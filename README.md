*This project has been created as part of the 42 curriculum by ashaheen, maabdulr, hinajib, <worod_login>.*

# PXL_LAB

**Big ideas. Small pixels.** PXL_LAB is a campus community web app for 42 students. Students join communities, chat in real time, share posts, add friends and find people by their skills.

## Table of contents

1. [Description](#description)
2. [Instructions](#instructions)
3. [Team Information](#team-information)
4. [Project Management](#project-management)
5. [Technical Stack](#technical-stack)
6. [Database Schema](#database-schema)
7. [Features List](#features-list)
8. [Modules](#modules)
9. [Individual Contributions](#individual-contributions)
10. [Resources](#resources)
11. [Known Limitations](#known-limitations)

---

## Description

### Goal

42 students learn by working together, but their conversations, projects and questions are spread across many apps. PXL_LAB brings them into one place: a community space where students meet, talk and share their work.

### Overview

- A student signs up with an email and password, then builds a profile with a display name, bio, avatar and skills.
- Students create or join **communities**. Each community has members with roles (owner, admin, moderator, member) and text **channels** for chat.
- Chat works in **real time**: typing indicators, read receipts, online status, file sharing (images and PDF) and blocking.
- The **feed** shows posts from the whole campus and from the student's communities, with images, likes and replies.
- **Notifications** arrive live for friend requests, invitations, replies, likes, and changes in communities and channels.
- **Search** finds people, communities, posts and skills, with filters, sorting and pages.
- A **site admin** manages user accounts and site roles (admin, user, guest). Guests can read but cannot change anything.

### Key features

| Feature | In one line |
|---|---|
| Communities | Create, edit and delete communities. Invite, add and remove members. Four member roles. |
| Real-time chat | Channels with typing indicators, read receipts, presence, images and PDF files. |
| Feed | Global and community posts with images, likes, nested replies and reports. |
| Friends | Friend requests, a friends list and online status. |
| Notifications | Live pop-ups, a badge and a notification page for every create, update and delete. |
| Search | People, communities, posts and skills, with filters, sorting and pagination. |
| Site administration | Admin page to view, edit and delete users and change their site role. |

---

## Instructions

### Prerequisites

| Tool | Version |
|---|---|
| Docker Engine | [TODO: version] |
| Docker Compose | [TODO: version] |
| Make | any |
| A modern browser | Latest Google Chrome |

[TODO Heba (Tech Lead): confirm the list once the Docker setup is final.]

### Environment variables

Copy the example files and fill in the secrets. The real `.env` files are ignored by Git.

```bash
cp ft_transcendence/transcendence-backend/.env.example ft_transcendence/transcendence-backend/.env
cp ft_transcendence/frontend/.env.example ft_transcendence/frontend/.env
```

| Variable | Where | Meaning |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `JWT_SECRET` | backend | Long random secret used to sign login tokens |
| `JWT_EXPIRES_IN_SECONDS` | backend | Login token lifetime (default 900) |
| `PORT` | backend | API port inside the container (default 3000) |
| `VITE_API_URL` | frontend | Public URL of the API |
| `VITE_SOCKET_URL` | frontend | Public URL of the chat server |

### Run the project

[TODO Heba (Tech Lead): replace with the final single command and the real URL.]

```bash
make            # or: docker compose up --build
```

Then open **https://localhost:[TODO port]** in Chrome.

### First site administrator

Public sign-up never creates an admin. To make an existing account an admin:

```bash
[TODO Heba (Tech Lead): the docker command that runs] npm run admin:promote -- <username>
```

### Tests

```bash
cd ft_transcendence/transcendence-backend && npm test     # backend unit tests
cd ft_transcendence/frontend && npm run lint             # frontend lint and type check
```

---

## Team Information

<!-- Roles were agreed on the first day of the project. Each member writes 3 to 5 responsibilities for her role(s). Afnan explains the Frontend Monitor role, which the team added. -->

| Member | Login | Role(s) |
|---|---|---|
| Afnan Shaheen | ashaheen | Frontend Monitor, Developer (Frontend) |
| Maram Abdulrashed | maabdulr | Project Manager (PM), Developer (Frontend) |
| Heba [TODO surname] | hinajib | Tech Lead, Developer (Backend) |
| Worod [TODO surname] | [TODO] | Product Owner (PO), Developer (Backend) |

**Afnan Shaheen** — Frontend Monitor, Developer (Frontend)
- Built interactive frontend features for the feed, chat, notifications, and search.
- Connected frontend components to backend API endpoints and WebSocket (Socket.IO) events.
- Tested frontend features with the team backend and fixed integration issues.
- Monitored frontend structure, shared components, and API integration.

**Maram Abdulrashed** — Project Manager (PM), Developer (Frontend)
- Managed task planning, frontend responsibilities, and integration work across the team.
- Built core frontend pages for communities, members, profiles, and site administration.
- Reviewed shared frontend changes and tested builds before integration.
- Coordinated frontend work through member branches and the shared `frontend-merge` branch.

<!-- HIBA: START (Team Information) -->
**Hiba Najib** — Tech Lead + Developer
- Developed the core backend using NestJS, PostgreSQL and Prisma.
- Implemented authentication, community permissions and site administration.
- Integrated backend additions and verified migrations, API behaviour and production builds.
<!-- HIBA: END -->

<!-- WOROD: START (Team Information) -->
**Worod [TODO]** — Product Owner (PO), Developer (Backend)
- Defined and reviewed PXL_LAB feature requirements and user workflows.
- Developed backend features for chat, social interactions, uploads, and search.
- Integrated backend functionality with the shared team application.
- Investigated bugs, added regression tests, and verified builds before integration.
<!-- WOROD: END -->

---

## Project Management

### How we organized the work

- We split development between frontend core, frontend interactive features, backend core, and real-time backend features.
- We used weekly task plans and team check-ins to review progress, blockers, integration, and remaining work.
- Each member worked on a personal branch before shared integration.
- Frontend work was combined in `frontend-merge` before the final merge into `main`.
- We tested integrated features before moving completed work into the final branch.

### Tools

| Purpose | Tool |
|---|---|
| Code and version control | GitHub (`Heva123/ft_transcendence`) |
| Task tracking | Weekly team task plan |
| Design | Sigma |
| Communication | WhatsApp |



---

## Technical Stack

| Layer | Technology | Why we chose it |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7 | React is a widely used framework with a large ecosystem. TypeScript catches errors before runtime. Vite gives fast builds. |
| Styling | Plain CSS with design tokens (`styles/tokens.css`) | One shared palette, spacing and typography for every screen, following our UI/UX design. |
| Real-time | Socket.IO (client and server) | Reliable WebSocket connection with automatic reconnection and rooms per channel. |
| Backend | NestJS 11 (Node.js, TypeScript) | Clear structure with modules, guards and dependency injection. The same language as the frontend. |
| Database | PostgreSQL 17 | Relational data (users, communities, members, messages) with strong consistency. |
| ORM | Prisma 6 | Typed queries, a readable schema and versioned migrations. |
| Authentication | JWT (passport-jwt), bcrypt password hashing | Stateless login tokens. Passwords are salted and hashed, never stored in plain text. |
| Validation | class-validator (backend), form checks (frontend) | Every input is checked on both sides. |
| API documentation | Swagger (OpenAPI) at `/api/docs` | Every endpoint is documented and can be tried in the browser. |
| Testing | Jest (backend unit tests), ESLint and TypeScript checks (frontend) | [TODO: number] unit tests run with `npm test`. |
| Deployment | Docker, Docker Compose, [TODO: nginx/Caddy] with HTTPS | One command starts the whole project. |

---

## Database Schema

PostgreSQL database managed with Prisma migrations. Main tables and how they connect:

```mermaid
erDiagram
    users ||--o{ members : "joins"
    groups ||--o{ members : "has"
    groups ||--o{ channels : "has"
    groups ||--o{ posts : "contains"
    groups ||--o{ community_invitations : "sends"
    channels ||--o{ Message : "contains"
    Message ||--o| message_attachments : "may have"
    Message ||--o{ message_reads : "read by"
    users ||--o{ posts : "writes"
    posts ||--o{ comments : "has"
    comments ||--o{ comments : "replies to"
    posts ||--o{ likes : "gets"
    users ||--o{ friendships : "requests"
    users ||--o{ blocks : "blocks"
    users ||--o{ notifications : "receives"
    users ||--o{ user_skills : "has"
    skills ||--o{ user_skills : "used in"
    groups ||--o{ reports : "receives"
```

| Table | Key fields | Purpose |
|---|---|---|
| `users` | `id` (UUID), `email` (unique), `username` (unique), `passwordHash`, `siteRole` (ADMIN, USER, GUEST), `displayName`, `bio`, `avatarPath`, `lastSeenAt` | Accounts and profiles |
| `groups` | `id`, `name`, `description`, `isPublic`, `createdById` | Communities |
| `members` | `userId`, `communityId`, `role` (OWNER, ADMIN, MODERATOR, MEMBER) | Who belongs to which community, with which role |
| `channels` | `id`, `communityId`, `name` (unique per community), `description` | Chat channels inside a community |
| `Message` | `id`, `channelId`, `authorId`, `content`, `createdAt` | Chat messages |
| `message_attachments` | `id`, `messageId`, `mimeType`, `size`, `path` | Images and PDF files sent in chat |
| `message_reads` | `messageId`, `userId`, `readAt` | Read receipts |
| `posts` | `id`, `authorId`, `communityId` (empty for the global feed), `content`, `imagePath` | Feed posts |
| `comments` | `id`, `postId`, `authorId`, `parentId`, `content` | Replies, including replies to replies |
| `likes` | `postId`, `userId` | One like per user per post |
| `friendships` | `requesterId`, `addresseeId`, `status` (PENDING, ACCEPTED) | Friend requests and friends |
| `blocks` | `blockerId`, `blockedId` | Blocked users |
| `community_invitations` | `communityId`, `inviterId`, `inviteeId`, `role`, `status` | Invitations by username |
| `reports` | `communityId`, `reporterId`, `targetType`, `reason`, `status` | Reports of posts or replies |
| `notifications` | `userId`, `type`, `title`, `message`, `link`, `isRead` | Notifications shown in the app |
| `skills`, `user_skills` | `name`, `userId`, `skillId` | Skills on profiles, used by search |

[TODO Heba: check field names against `prisma/schema.prisma` and remove the `projects` and `tasks` tables from the schema, or add them here with a reason.]

---

## Features List

<!-- Each member checks the rows with her name. Add a row if a feature is missing. Keep one line per description. -->

| Feature | What it does | Who |
|---|---|---|
| Sign up and log in | Email and password accounts, validation on both sides, hashed passwords, JWT sessions | Maram (UI), Heba (API) |
| Profiles | Display name, bio, skills, avatar with a default image, public profile page | Maram, Afnan (UI), Heba (API), Worod (uploads) |
| Settings | Edit account details, blocked users | Maram |
| Friends | Friend requests, accept, remove, friends list with online status | Afnan (UI), Heba (API) |
| Communities | Create, edit, delete, discover, join, leave | Maram (UI), Heba (API) |
| Members and roles | Invite by username, change roles, remove members, roles page | Maram, Afnan (UI), Heba (API) |
| Channels | Create, edit and delete channels by role | Afnan (UI), Heba (API) |
| Real-time chat | Messages, typing, read receipts, presence, unread counters, reconnect | Afnan (UI), Worod (server) |
| Files in chat | Images and PDF with preview, download, type and size checks, access control | Afnan (UI), Worod (API) |
| Blocking | Block and unblock users, hidden messages | Afnan (UI), Worod, Heba (API) |
| Feed and posts | Global and community feed, images, likes, nested replies, edit, delete, paging | Afnan (UI), Worod (API) |
| Reports | Report posts and replies. Owners, admins and moderators review them in the moderation queue, keep or remove the content, and resolve or dismiss the report. | Afnan (report form), Maram (queue), Worod, Heba (API) |
| Notifications | Live pop-ups, badge, unread filter, a notification for every create, update and delete | Afnan (UI), Worod, Heba (API) |
| Search | People, communities, posts and skills, filters, sorting, pagination | Afnan (UI), Worod (API) |
| Site administration | Admin page, site roles, guest read-only access | Maram (UI), Heba (API) |
| Privacy Policy and Terms | Public legal pages linked from the app | Afnan, Maram |
| [TODO] | [TODO] | [TODO] |

---

## Modules

**Total: 16 points** (14 required). [TODO: confirm the final list as a team.]

| Module | Type | Points | Who |
|---|---|---|---|
| Use a framework for frontend and backend (React + NestJS) | Major | 2 | Everyone |
| Real-time features with WebSockets | Major | 2 | Worod, Afnan |
| User interaction: chat, profiles, friends | Major | 2 | Afnan, Worod, Heba |
| Standard user management and authentication | Major | 2 | Heba, Maram |
| Organization system (communities) | Major | 2 | Heba, Maram |
| Advanced permissions system | Major | 2 | Heba, Maram |
| Use an ORM (Prisma) | Minor | 1 | Heba, Worod |
| Notification system for all create, update and delete actions | Minor | 1 | Worod, Heba, Afnan |
| Advanced search with filters, sorting and pagination | Minor | 1 | Worod, Afnan |
| File upload and management | Minor | 1 | Worod, Afnan |
| **Total** | | **16** | |

<!-- One writer per module (marked below). The others check it. -->

### Frameworks (Major, 2 pts)
- **Why we chose it:** React gives the frontend reusable components and clear state management. NestJS gives the backend a structured module system. TypeScript is used on both sides and helps detect errors before runtime.
- **How it works:** The frontend uses React 19, TypeScript, React Router, and Vite. NestJS 11 structures the backend using modules, controllers, and services. The frontend communicates with the backend through API requests.

<!-- WOROD: START (Module) -->
### Real-time features (Major, 2 pts)
- **Why we chose it:** Students need immediate communication without refreshing the page. WebSockets support live chat, typing indicators, read receipts, and online presence.
- **How it works:** NestJS uses Socket.IO through `chat.gateway.ts`. Clients authenticate using JWT, join authorized channel rooms, exchange messages, and receive presence and typing events. Messages and read states are persisted through Prisma. The gateway also waits for authentication before processing early events.
<!-- WOROD: END -->

### User interaction (Major, 2 pts)
- **Why we chose it:** We wanted 42 students to connect and communicate inside PXL_LAB. Users can build profiles, add friends, and chat in real time. This helps students interact and stay connected within their communities.

- **How it works:** Users create profiles with an avatar, bio, and skills. They can send, accept, and remove friend requests. The frontend displays friends and their online status. `ChatArea.tsx` and `useChatSocket.ts` handle messages, typing indicators, and read receipts through WebSocket (Socket.IO).


### Standard user management (Major, 2 pts)
- **Why we chose it:** [CHECK: confirm the team's reason for choosing this module.] Student accounts support profiles and authenticated access.
- **How it works:** Students sign up and log in through `auth.controller.ts`. Passwords are hashed with bcrypt, and JWT authentication protects account endpoints. Users edit their profiles through `PATCH /api/users/me`. Profiles include avatars, bios and skills, with a default image when no avatar is uploaded.


### Organization system (Major, 2 pts)
- **Why we chose it:** Communities give students dedicated spaces for shared interests and discussions. Member roles control how each student manages a community.
- **How it works:** Users can discover, create, join, and leave communities. `CommunitiesPage.tsx` and `DiscoverCommunitiesPage.tsx` display community information. `CommunityMembersPage.tsx` manages members and member roles. Communities support owner, admin, moderator, and member roles.


### Advanced permissions (Major, 2 pts)
- **Why we chose it:** [CHECK: confirm the team's reason for choosing this module.] Site roles separate account administration from community permissions.
- **How it works:** Prisma stores each account's site role as admin, user or guest. `SiteAdminGuard` restricts `/api/admin/users` to site administrators. Administrators can list, create, edit and delete accounts. Guest write restrictions apply to HTTP endpoints and WebSocket (Socket.IO) chat events.


<!-- WOROD: START (Module) -->
### ORM (Minor, 1 pt)
- **Why we chose it:** Prisma provides a typed and structured way to interact with PostgreSQL, manage relationships, and maintain the database schema.
- **How it works:** Database models and relationships are defined in `prisma/schema.prisma`. NestJS services use `PrismaService` to query and update users, communities, posts, messages, notifications, and other records. Prisma migrations manage schema changes.
<!-- WOROD: END -->

### Notification system (Minor, 1 pt)
 **Why we chose it:** We wanted students to know when something important happens. Notifications help users follow friend requests, replies, likes, and community activity.
- **How it works:** The backend creates notification records for supported actions. WebSocket (Socket.IO) sends notification updates in real time. The frontend uses `useNotifications.ts` and `notificationSocket.ts` to receive updates. The interface displays pop-ups, unread counts, and notification lists.

### Advanced search (Minor, 1 pt)
 **Why we chose it:** We wanted students to find people and content without checking every page. Filters, sorting, and pagination make search results easier to explore.
- **How it works:** `SearchPage.tsx` provides search interfaces for people, communities, posts, and skills. Users enter search terms and select available filters or sorting options. `usePagedSearch.ts` manages requests and paginated results. The backend API returns matching records from the database.

<!-- WOROD: START (Module) -->
### File upload and management (Minor, 1 pt)
- **Why we chose it:** Students need to share avatars, post images, and chat attachments securely within the application.
- **How it works:** `uploads.controller.ts` and `uploads.service.ts` manage uploading, retrieving, and deleting files. Upload validation checks allowed file types, extensions, and size limits. JWT authentication and resource access checks protect supported upload operations.
<!-- WOROD: END -->

---

## Individual Contributions

<!-- Same structure for everyone. See the PXL_LAB README guide. -->

### Afnan Shaheen

**Summary.** Afnan developed interactive frontend features for PXL_LAB using React and TypeScript. She connected the feed, chat, notifications, and search to the team backend.

**What she built**
- **Feed and posts.** Users view global and community posts, add likes, and write replies. Afnan built `Feed.tsx`, `PostCard.tsx`, and `feedApi.ts`.
- **Nested replies.** Users reply to posts and other replies. Afnan developed the reply interface using `ReplyItem.tsx`.
- **Real-time chat.** The channel interface shows messages, typing indicators, read receipts, and online members. She worked on `ChatArea.tsx` and `useChatSocket.ts`.
- **Chat file attachments.** Users send images and PDF files through chat. She added file selection and upload handling using `ImageAttachmentPicker.tsx` and `uploadRequest()`.
- **Notifications.** The frontend shows notification pop-ups, unread counts, and notification lists. She worked on `useNotifications.ts` and `notificationSocket.ts`.
- **Advanced search.** Users search for people, communities, posts, and skills. She implemented frontend search and pagination using `SearchPage.tsx` and `usePagedSearch.ts`.
- **Frontend API integration.** Afnan prepared feed API integration and configured the frontend API proxy. She also changed frontend code to handle string IDs consistently.
- **Shared application layout.** Afnan built reusable layout components, including `AppShell.tsx`, `Sidebar.tsx`, and `TopBar.tsx`.

**Challenges**
- **Unexpected logouts.** Some page loads ended with a session error during multi-user testing. Afnan traced the issue to an early `auth:error` event. She changed the flow to check the login through the API before logging out.
- **Chat reconnection.** Chat stopped receiving messages after the backend restarted. She updated the frontend to join the channel again after reconnecting.
- **Frontend and backend integration.** Some frontend features needed changes to match backend data and endpoints. She updated frontend ID handling, prepared API integration, and tested the changes with the team backend.


### Maram Abdulrashed

**Summary.** Maram developed core frontend pages and community management features using React and TypeScript. She also managed project planning and frontend integration.

**What she built**
- **Authentication interface.** Maram worked on login and sign-up screens, validation, and frontend authentication integration.
- **Communities.** Users can view their communities and discover available communities. Main files include `CommunitiesPage.tsx` and `DiscoverCommunitiesPage.tsx`.
- **Community details and members.** Maram built community details and member management interfaces. Main files include `CommunityDetailsPage.tsx` and `CommunityMembersPage.tsx`.
-  **Moderation queue.** Community owners, admins and moderators can review reported posts and replies. Maram added the Reports page with actions to keep or remove content and resolve or dismiss reports.
- **Site administration.** Site admins can view users and manage site roles. Maram worked on `AdminUsersPage.tsx` and `userApi.ts`.
- **Profiles and avatars.** Maram worked on profile views and default avatar handling. Main files include `ProfilePage.tsx` and `PublicProfilePage.tsx`.
- **Guest access.** Guest users receive a read-only interface without create, join, or edit actions. She worked on `GuestBanner.tsx` and `useCanWrite.ts`.
- **Responsive frontend.** Maram fixed layouts that stretched outside the page on tablet screens. She updated `AppShell.tsx` and `layout.css`.
- **Accessibility.** She added labels for member search and member role controls in `CommunityMembersPage.tsx`.

**Challenges**
- **Admin user loading.** The API returned a paged object instead of a user array. Maram changed the frontend to read the `items` array.
- **Default avatar requests.** Profiles requested a missing avatar file when users had no uploaded image. She corrected the default avatar handling.
- **Guest and tablet behaviour.** Guest controls remained visible and some pages overflowed on tablets. She added write checks and responsive layout fixes.

### Hiba Najib

**Summary.** Hiba developed the core backend and integrated additional account features. Her work supports authentication, community management and site administration.

**What she built**
- **Authentication.** Students sign up and log in through JWT authentication with bcrypt password hashing. Main file: `auth.service.ts`.
- **Community permissions.** She implemented community membership and member roles: owner, admin, moderator and member. Main file: `community-members.service.ts`.
- **Channels, projects and tasks.** She developed APIs for managing these resources. Main files: `channels.service.ts`, `projects.service.ts` and `tasks.service.ts`.
- **Profiles and skills.** She integrated teammate changes for display names, bios, skills and public profiles. Main endpoints: `PATCH /api/users/me` and `GET /api/users/:username`.
- **Friends and invitations.** She integrated friend requests and community invitations. She added blocking and permission checks during acceptance.
- **Site administration.** She added site roles: admin, user and guest. Administrators manage accounts through `admin-users.controller.ts` and `admin-users.service.ts`.
- **Guest restrictions.** Guest accounts have read-only access. Main files: `guest-readonly.guard.ts`, `messages.service.ts` and `chat.gateway.ts`.
- **Documentation and default avatar.** She added Swagger documentation at `/api/docs`. Profiles without uploaded avatars use `/api/default-avatar`.

**Challenges**
- **Missing upload source.** A copy command excluded `src/uploads`, although `app.module.ts` still imported it. She restored the existing source files and verified the build.
- **Outdated invitation permissions.** An invitation could remain usable after blocking or inviter demotion. She added acceptance checks and verified rejection through API tests.
- **Database configuration.** Missing `DATABASE_URL` settings prevented migrations. She configured the local environment and applied migrations without resetting the database.


<!-- WOROD: START (Individual Contributions) -->
### Worod

**Summary.** Worod developed and integrated backend features for PXL_LAB, including real-time communication, social interactions, file uploads, and advanced search. She also worked on integration fixes, regression testing, and verifying the shared application before merging changes.

**What she built**
- **Real-time communication.** Implemented Socket.IO chat functionality including authenticated connections, channel rooms, messages, typing indicators, read receipts, and online presence. Main file: `chat.gateway.ts`.
- **Posts, comments, and likes.** Developed REST APIs for global and community feeds, post management, nested comments, and likes, and adapted the features to the integrated backend.
- **File uploads.** Implemented API functionality for profile avatars, chat attachments, and post images, including file validation and access checks. Main files: `uploads.controller.ts` and `uploads.service.ts`.
- **Advanced search.** Implemented backend search for users, skills, communities, and posts, including filtering, pagination, and authorization-aware results. Main file: `search.service.ts`.
- **Integration and testing.** Worked on notifications and shared backend integration, added regression tests, and verified the backend test suite and production build.

**Challenges**
- **Early Socket.IO events.** Events could arrive before JWT authentication completed, causing incorrect authentication errors. She updated the gateway to wait for authentication and added a regression test.
- **Search pagination.** Empty search results could report an incorrect previous-page state. She corrected the pagination logic and added a regression test.
- **Shared backend integration.** The original social backend used a separate database structure. She adapted social features to the shared Prisma schema and application architecture.

<!-- WOROD: END -->

---

## Resources

### References

| Topic | Link |
|---|---|
| React | https://react.dev |
| Vite | https://vite.dev |
| React Router | https://reactrouter.com |
| NestJS | https://docs.nestjs.com |
| Prisma | https://www.prisma.io/docs |
| PostgreSQL | https://www.postgresql.org/docs |
| Socket.IO | https://socket.io/docs/v4 |
| JWT | https://jwt.io/introduction |
| OWASP password storage | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html |
| WCAG 2.1 | https://www.w3.org/TR/WCAG21 |
| [TODO: add the tutorials and articles you really used] | |

### How we used AI

<!-- Be honest and specific. The subject requires which tasks and which parts. Each member adds her own bullets. -->

We used AI tools as assistants. Every result was read, tested and changed by us before it went into the project.

- **Afnan** — ChatGPT helped explain React and TypeScript concepts and review frontend integration problems. She used it while working on components, API requests, chat, and notifications. She reviewed the suggested changes, tested the frontend with the team backend, and checked the results in the browser.

- **Maram** — ChatGPT helped explain React, TypeScript, API integration, Git workflows, and frontend debugging. She used it while reviewing code, planning fixes, and understanding integration issues. Claude assisted with drafting the moderation queue page patch. Maram reviewed the changes, applied the patch under her own name, and verified the integration before pushing it to main.

<!-- HEBA: START (AI) -->
- **Heba** — [TODO]
<!-- HEBA: END -->
<!-- WOROD: START (AI) -->
- **Worod** — Used ChatGPT to understand NestJS, Socket.IO, JWT authentication, and backend integration concepts. It also assisted with debugging early WebSocket authentication events, reviewing search pagination, planning regression tests, checking Git integration steps, and drafting documentation. Suggested changes were reviewed against the project code and verified using Jest tests and the NestJS build.
<!-- WOROD: END -->

---

## Known Limitations

- The application was tested in Google Chrome.
- Other browsers are not officially supported because they were not fully tested.
- Reports can be sent and reviewed through the API, but there is no moderation screen yet.


## License and credits

Made by the PXL_LAB team at 42 Abu Dhabi for the ft_transcendence project. All rights reserved.
