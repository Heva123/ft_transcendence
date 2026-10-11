import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateMessageDto {
  @Transform(({ value }) =>
    typeof value === "string"
      ? value.trim()
      : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsUUID()
  attachmentId?: string;
}
