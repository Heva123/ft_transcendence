import { IsUUID } from "class-validator";

export class SendFriendRequestDto {
  @IsUUID()
  userId!: string;
}
