import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { SendFriendRequestDto } from "./dto/send-friend-request.dto";
import { FriendsService } from "./friends.service";

@UseGuards(JwtAuthGuard)
@Controller("friends")
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  findFriends(@CurrentUser() user: AuthUser) {
    return this.friendsService.findFriends(user.id);
  }

  @Get("requests")
  findRequests(@CurrentUser() user: AuthUser) {
    return this.friendsService.findRequests(user.id);
  }

  @Post("requests")
  sendRequest(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(user.id, dto.userId);
  }

  @Post("requests/:requestId/accept")
  accept(
    @CurrentUser() user: AuthUser,
    @Param("requestId", ParseUUIDPipe) requestId: string,
  ) {
    return this.friendsService.accept(user.id, requestId);
  }

  @Delete("requests/:requestId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRequest(
    @CurrentUser() user: AuthUser,
    @Param("requestId", ParseUUIDPipe) requestId: string,
  ) {
    await this.friendsService.removeRequest(user.id, requestId);
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFriend(
    @CurrentUser() user: AuthUser,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    await this.friendsService.removeFriend(user.id, userId);
  }
}
