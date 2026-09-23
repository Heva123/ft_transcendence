import { ChannelType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateChannelDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9][a-z0-9-]*$/, {
    message: "name may contain lowercase letters, numbers and hyphens",
  })
  name: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType = ChannelType.TEXT;
}
