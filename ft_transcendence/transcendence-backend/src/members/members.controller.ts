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
import { GroupPermissionGuard } from "../permissions/guards/group-permission.guard";
import { Permission } from "../permissions/permission.enum";
import { AddMemberDto } from "./dto/add-member.dto";
import { ChangeMemberRoleDto } from "./dto/change-member-role.dto";
import { MembersService } from "./members.service";

@UseGuards(JwtAuthGuard, GroupPermissionGuard)
@Controller("groups/:groupId/members")
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @RequirePermissions(Permission.MEMBER_READ)
  findAll(
    @CurrentUser() user: AuthUser,
    @Param("groupId", ParseUUIDPipe) groupId: string,
  ) {
    return this.membersService.findAll(user.id, groupId);
  }

  @Post()
  @RequirePermissions(Permission.MEMBER_ADD)
  add(
    @CurrentUser() user: AuthUser,
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.membersService.add(user.id, groupId, dto);
  }

  @Patch(":memberId/role")
  @RequirePermissions(Permission.MEMBER_CHANGE_ROLE)
  changeRole(
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
    @Body() dto: ChangeMemberRoleDto,
  ) {
    return this.membersService.changeRole(groupId, memberId, dto);
  }

  @Delete(":memberId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MEMBER_REMOVE)
  async remove(
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
  ) {
    await this.membersService.remove(groupId, memberId);
  }
}
