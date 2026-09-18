import { GroupRole } from "@prisma/client";
import { Permission } from "../permissions/permission.enum";

export const ROLE_PERMISSIONS: Record<GroupRole, readonly Permission[]> = {
  [GroupRole.OWNER]: Object.values(Permission),
  [GroupRole.ADMIN]: [
    Permission.GROUP_READ,
    Permission.GROUP_UPDATE,
    Permission.MEMBER_READ,
    Permission.MEMBER_ADD,
    Permission.MEMBER_REMOVE,
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.TASK_READ,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
  ],
  [GroupRole.MEMBER]: [
    Permission.GROUP_READ,
    Permission.MEMBER_READ,
    Permission.PROJECT_READ,
    Permission.TASK_READ,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
  ],
};

export function roleHasPermissions(
  role: GroupRole,
  requiredPermissions: readonly Permission[],
) {
  const grantedPermissions = ROLE_PERMISSIONS[role];
  return requiredPermissions.every((permission) =>
    grantedPermissions.includes(permission),
  );
}
