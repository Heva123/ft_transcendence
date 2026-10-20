import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RealtimeEventsService } from "../realtime/realtime-events.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly realtimeEvents: RealtimeEventsService,
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findMe(user.id);
  }

  @Get("blocked")
  findBlockedUsers(@CurrentUser() user: AuthUser) {
    return this.usersService.findBlockedUsers(user.id);
  }

  @Post(":userId/block")
  blockUser(
    @CurrentUser() user: AuthUser,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.blockUser(user.id, userId);
  }

  @Delete(":userId/block")
  async unblockUser(
    @CurrentUser() user: AuthUser,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    const result = await this.usersService.unblockUser(
      user.id,
      userId,
    );

    this.realtimeEvents.emitUserUnblocked(
      userId,
      user.id,
    );

    return result;
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  // Declared last so "me" and "blocked" are matched first.
  @Get(":username")
  findProfile(
    @CurrentUser() user: AuthUser,
    @Param("username") username: string,
  ) {
    return this.usersService.findPublicProfile(user.id, username);
  }
}
