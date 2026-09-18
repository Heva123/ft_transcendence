import { GroupRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsIn, IsOptional, MaxLength } from "class-validator";

export class AddMemberDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsEnum(GroupRole)
  @IsIn([GroupRole.ADMIN, GroupRole.MEMBER], {
    message: "role must be ADMIN or MEMBER",
  })
  role?: GroupRole = GroupRole.MEMBER;
}
