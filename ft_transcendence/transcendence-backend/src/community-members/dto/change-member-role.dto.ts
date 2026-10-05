import { CommunityRole } from "@prisma/client";
import { IsEnum, IsIn } from "class-validator";

export class ChangeCommunityMemberRoleDto {
  @IsEnum(CommunityRole)
  @IsIn([CommunityRole.ADMIN, CommunityRole.MODERATOR, CommunityRole.MEMBER], {
    message: "role must be ADMIN, MODERATOR or MEMBER",
  })
  role: CommunityRole;
}
