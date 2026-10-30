import { CommunityRole } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateInvitationDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().replace(/^@/, "") : value))
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @IsOptional()
  @IsEnum(CommunityRole)
  @IsIn([CommunityRole.ADMIN, CommunityRole.MODERATOR, CommunityRole.MEMBER], {
    message: "role must be ADMIN, MODERATOR or MEMBER",
  })
  role?: CommunityRole = CommunityRole.MEMBER;
}
