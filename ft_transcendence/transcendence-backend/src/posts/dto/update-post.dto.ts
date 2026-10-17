import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
