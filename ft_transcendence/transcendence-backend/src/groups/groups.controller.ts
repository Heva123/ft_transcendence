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
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { GroupsService } from "./groups.service";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { GroupPermissionGuard } from "../permissions/guards/group-permission.guard";
import { Permission } from "../permissions/permission.enum";

@UseGuards(JwtAuthGuard)
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.groupsService.findAllForUser(user.id);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) groupId: string,
  ) {
    return this.groupsService.findOneForUser(user.id, groupId);
  }

  @Patch(":groupId")
  @UseGuards(GroupPermissionGuard)
  @RequirePermissions(Permission.GROUP_UPDATE)
  update(
    @Param("groupId", ParseUUIDPipe) groupId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(groupId, dto);
  }

  @Delete(":groupId")
  @UseGuards(GroupPermissionGuard)
  @RequirePermissions(Permission.GROUP_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("groupId", ParseUUIDPipe) groupId: string) {
    await this.groupsService.remove(groupId);
  }
}
