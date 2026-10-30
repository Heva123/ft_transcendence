import { SiteRole } from "@prisma/client";
import { PickType, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  ValidateIf,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { RegisterDto } from "../../auth/dto/register.dto";
import { UpdateUserDto } from "../../users/dto/update-user.dto";

export class CreateAdminUserDto extends RegisterDto {
  @ApiPropertyOptional({ enum: SiteRole, default: SiteRole.USER })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(SiteRole)
  siteRole?: SiteRole = SiteRole.USER;
}

export class UpdateAdminUserDto extends PickType(UpdateUserDto, [
  "email",
  "username",
  "displayName",
  "bio",
] as const) {
  @ApiPropertyOptional({ enum: SiteRole })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(SiteRole)
  siteRole?: SiteRole;
}

export class ListAdminUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  q?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
