import { SetMetadata } from "@nestjs/common";
import { Permission } from "../permission.enum";

export const REQUIRED_PERMISSIONS_KEY = "required-group-permissions";

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
