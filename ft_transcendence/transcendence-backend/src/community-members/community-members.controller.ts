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
import { AddCommunityMemberDto } from "./dto/add-member.dto";
import { ChangeCommunityMemberRoleDto } from "./dto/change-member-role.dto";
import { CommunityMembersService } from "./community-members.service";

@UseGuards(JwtAuthGuard, CommunityPermissionGuard)
@Controller("communities/:communityId/members")
export class CommunityMembersController {
  constructor(
    private readonly communityMembersService: CommunityMembersService,
  ) {}

  @Get()
  @RequirePermissions(Permission.MEMBER_READ)
  findAll(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
  ) {
    return this.communityMembersService.findAll(user.id, communityId);
  }

  @Post()
  @RequirePermissions(Permission.MEMBER_ADD)
  add(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: AddCommunityMemberDto,
  ) {
    return this.communityMembersService.add(user.id, communityId, dto);
  }

  @Patch(":memberId/role")
  @RequirePermissions(Permission.MEMBER_CHANGE_ROLE)
  changeRole(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
    @Body() dto: ChangeCommunityMemberRoleDto,
  ) {
    return this.communityMembersService.changeRole(
      user.id,
      communityId,
      memberId,
      dto,
    );
  }

  @Delete(":memberId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MEMBER_REMOVE)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
  ) {
    await this.communityMembersService.remove(user.id, communityId, memberId);
  }
}
