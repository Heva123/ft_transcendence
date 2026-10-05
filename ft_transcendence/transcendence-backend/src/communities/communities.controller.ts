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
import { CreateCommunityDto } from "./dto/create-community.dto";
import { UpdateCommunityDto } from "./dto/update-community.dto";
import { CommunitiesService } from "./communities.service";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { CommunityPermissionGuard } from "../permissions/guards/community-permission.guard";
import { Permission } from "../permissions/permission.enum";

@UseGuards(JwtAuthGuard)
@Controller("communities")
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.communitiesService.findAllForUser(user.id);
  }

  @Get("discover")
  discover(@CurrentUser() user: AuthUser) {
    return this.communitiesService.discover(user.id);
  }

  @Post(":communityId/join")
  join(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
  ) {
    return this.communitiesService.join(user.id, communityId);
  }

  @Delete(":communityId/leave")
  @HttpCode(HttpStatus.NO_CONTENT)
  async leave(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
  ) {
    await this.communitiesService.leave(user.id, communityId);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) communityId: string,
  ) {
    return this.communitiesService.findOneForUser(user.id, communityId);
  }

  @Patch(":communityId")
  @UseGuards(CommunityPermissionGuard)
  @RequirePermissions(Permission.COMMUNITY_UPDATE)
  update(
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(communityId, dto);
  }

  @Delete(":communityId")
  @UseGuards(CommunityPermissionGuard)
  @RequirePermissions(Permission.COMMUNITY_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("communityId", ParseUUIDPipe) communityId: string) {
    await this.communitiesService.remove(communityId);
  }
}
