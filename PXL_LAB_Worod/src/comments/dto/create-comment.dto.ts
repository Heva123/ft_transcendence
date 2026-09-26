import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  parentId?: string | null;
}
