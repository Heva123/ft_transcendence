import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { SiteAdminGuard } from "./site-admin.guard";
import { AdminUsersService } from "./admin-users.service";
import {
  CreateAdminUserDto,
  ListAdminUsersDto,
  UpdateAdminUserDto,
} from "./dto/admin-user.dto";

@ApiTags("Site administration")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SiteAdminGuard)
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: "List users with search and pagination (site ADMIN only)",
  })
  list(@Query() query: ListAdminUsersDto) {
    return this.users.list(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a user with an initial site role" })
  create(@CurrentUser() actor: AuthUser, @Body() dto: CreateAdminUserDto) {
    return this.users.create(actor.id, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() actor: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.users.update(actor.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({
    summary: "Permanently delete a user and their owned/authored content",
    description:
      "Deletes owned communities, authored channels/projects/tasks/posts/comments and cascading dependent records. No self-deletion or removal of the final administrator.",
  })
  remove(
    @CurrentUser() actor: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.users.remove(actor.id, id);
  }
}
