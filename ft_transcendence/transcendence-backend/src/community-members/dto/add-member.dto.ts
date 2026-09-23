import { CommunityRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsIn, IsOptional, MaxLength } from "class-validator";

export class AddCommunityMemberDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsEnum(CommunityRole)
  @IsIn([CommunityRole.ADMIN, CommunityRole.MODERATOR, CommunityRole.MEMBER], {
    message: "role must be ADMIN, MODERATOR or MEMBER",
  })
  role?: CommunityRole = CommunityRole.MEMBER;
}
