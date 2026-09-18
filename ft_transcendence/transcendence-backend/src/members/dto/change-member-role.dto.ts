import { GroupRole } from "@prisma/client";
import { IsEnum, IsIn } from "class-validator";

export class ChangeMemberRoleDto {
  @IsEnum(GroupRole)
  @IsIn([GroupRole.ADMIN, GroupRole.MEMBER], {
    message: "role must be ADMIN or MEMBER",
  })
  role: GroupRole;
}
