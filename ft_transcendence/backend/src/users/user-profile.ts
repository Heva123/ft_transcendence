import { Prisma } from "@prisma/client";

export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarPath: true,
  lastSeenAt: true,
  createdAt: true,
  skills: {
    select: { skill: { select: { name: true } } },
    orderBy: { skill: { name: "asc" } },
  },
} satisfies Prisma.UserSelect;

export type PublicUserRow = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;

export function toPublicUser(user: PublicUserRow) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarPath
      ? `/api/uploads/avatar/${user.id}`
      : "/api/default-avatar",
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
    skills: user.skills.map((item) => item.skill.name),
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;
