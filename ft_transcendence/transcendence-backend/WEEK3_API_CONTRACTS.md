# Week 3 Community API Contracts

Base URL: `http://localhost:3000/api`

All endpoints require `Authorization: Bearer <accessToken>`.

## Ready endpoints

### Communities

| Method | Path | Success |
| --- | --- | --- |
| POST | `/communities` | `201` community plus owner role |
| GET | `/communities` | `200` current user's communities |
| GET | `/communities/discover` | `200` public communities not joined |
| GET | `/communities/:communityId` | `200` community details |
| PATCH | `/communities/:communityId` | `200` updated community |
| DELETE | `/communities/:communityId` | `204` |
| POST | `/communities/:communityId/join` | `201` membership |
| DELETE | `/communities/:communityId/leave` | `204` |

Create body:

```json
{
  "name": "Transcendence Team",
  "description": "Main development community",
  "isPublic": true
}
```

### Members

| Method | Path | Success |
| --- | --- | --- |
| GET | `/communities/:communityId/members` | `200` member array |
| POST | `/communities/:communityId/members` | `201` member |
| PATCH | `/communities/:communityId/members/:memberId/role` | `200` member |
| DELETE | `/communities/:communityId/members/:memberId` | `204` |

Add body:

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

Role body:

```json
{
  "role": "MODERATOR"
}
```

Valid roles: `OWNER`, `ADMIN`, `MODERATOR`, `MEMBER`.

### Channels

| Method | Path | Success |
| --- | --- | --- |
| GET | `/communities/:communityId/channels` | `200` channel array |
| POST | `/communities/:communityId/channels` | `201` channel |
| GET | `/channels/:channelId` | `200` channel |
| PATCH | `/channels/:channelId` | `200` updated channel |
| DELETE | `/channels/:channelId` | `204` |

Create body:

```json
{
  "name": "general",
  "description": "General discussion",
  "type": "TEXT"
}
```

Update body:

```json
{
  "name": "announcements",
  "description": "Important announcements"
}
```

## Common errors

| Status | Meaning |
| --- | --- |
| `400` | Invalid UUID or request body |
| `401` | Missing, invalid, or expired JWT |
| `403` | Authenticated but not permitted |
| `404` | Community, membership, or channel not found |
| `409` | Duplicate membership or channel name |

## Chat integration boundary

The Core backend owns `Community`, `CommunityMember`, and `Channel`. The chat
backend should add a `Message` model that references `Channel.id` and `User.id`:

```prisma
model Message {
  id        String   @id @default(uuid())
  channelId String
  authorId  String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  channel Channel @relation(fields: [channelId], references: [id], onDelete: Cascade)
  author  User    @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

Worod should add the inverse `messages Message[]` fields to `Channel` and
`User`, then create one separate migration for chat. Message access must verify
that the current user has a `CommunityMember` row for the channel's community.
