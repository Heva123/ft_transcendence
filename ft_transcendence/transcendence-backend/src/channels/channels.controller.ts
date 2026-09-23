import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { CommunityPermissionGuard } from "../permissions/guards/community-permission.guard";
import { Permission } from "../permissions/permission.enum";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";

@UseGuards(JwtAuthGuard, CommunityPermissionGuard)
@Controller()
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get("communities/:communityId/channels")
  @RequirePermissions(Permission.CHANNEL_READ)
  findAll(@Param("communityId", ParseUUIDPipe) communityId: string) {
    return this.channelsService.findAll(communityId);
  }

  @Post("communities/:communityId/channels")
  @RequirePermissions(Permission.CHANNEL_CREATE)
  create(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: CreateChannelDto,
  ) {
    return this.channelsService.create(communityId, user.id, dto);
  }

  @Get("channels/:channelId")
  @RequirePermissions(Permission.CHANNEL_READ)
  findOne(@Param("channelId", ParseUUIDPipe) channelId: string) {
    return this.channelsService.findOne(channelId);
  }

  @Patch("channels/:channelId")
  @RequirePermissions(Permission.CHANNEL_UPDATE)
  update(
    @Param("channelId", ParseUUIDPipe) channelId: string,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.channelsService.update(channelId, dto);
  }

  @Delete("channels/:channelId")
  @RequirePermissions(Permission.CHANNEL_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("channelId", ParseUUIDPipe) channelId: string) {
    await this.channelsService.remove(channelId);
  }
}
