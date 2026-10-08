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
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthUser) {
    return user;
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
  unblockUser(
    @CurrentUser() user: AuthUser,
    @Param("userId", ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.unblockUser(user.id, userId);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }
}
