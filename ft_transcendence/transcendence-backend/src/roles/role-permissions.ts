import { CommunityRole } from "@prisma/client";
import { Permission } from "../permissions/permission.enum";

export const ROLE_PERMISSIONS: Record<CommunityRole, readonly Permission[]> = {
  [CommunityRole.OWNER]: Object.values(Permission),
  [CommunityRole.ADMIN]: [
    Permission.COMMUNITY_READ,
    Permission.COMMUNITY_UPDATE,
    Permission.MEMBER_READ,
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE,
    Permission.CHANNEL_READ,
    Permission.CHANNEL_CREATE,
    Permission.CHANNEL_UPDATE,
    Permission.CHANNEL_DELETE,
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.TASK_READ,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
  ],
  [CommunityRole.MODERATOR]: [
    Permission.COMMUNITY_READ,
    Permission.MEMBER_READ,
    Permission.MEMBER_REMOVE,
    Permission.CHANNEL_READ,
    Permission.CHANNEL_CREATE,
    Permission.CHANNEL_UPDATE,
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
  ],
  [CommunityRole.MEMBER]: [
    Permission.COMMUNITY_READ,
    Permission.MEMBER_READ,
    Permission.CHANNEL_READ,
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
  ],
};

export function roleHasPermissions(
  role: CommunityRole,
  requiredPermissions: readonly Permission[],
) {
  const grantedPermissions = ROLE_PERMISSIONS[role];
  return requiredPermissions.every((permission) =>
    grantedPermissions.includes(permission),
  );
}
