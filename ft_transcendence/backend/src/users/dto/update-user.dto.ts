import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsNotIn,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @IsNotIn(["me", "blocked"], { message: "This username is reserved" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "username can contain only letters, numbers, and underscores",
  })
  username?: string;

  /** Empty string clears the display name. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(50)
  displayName?: string;

  /** Empty string clears the bio. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  bio?: string;

  /** Replaces the whole skill list. Duplicates are removed. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === "string" ? item.trim() : item))
      : value,
  )
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(30, { each: true })
  @Matches(/^[\p{L}\p{N} +#./_-]+$/u, {
    each: true,
    message: "skills can contain letters, numbers, spaces and + # . / _ -",
  })
  skills?: string[];
}
