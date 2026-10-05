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
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@UseGuards(JwtAuthGuard, CommunityPermissionGuard)
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post("communities/:communityId/projects")
  @RequirePermissions(Permission.PROJECT_CREATE)
  create(
    @CurrentUser() user: AuthUser,
    @Param("communityId", ParseUUIDPipe) communityId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, communityId, dto);
  }

  @Get("communities/:communityId/projects")
  @RequirePermissions(Permission.PROJECT_READ)
  findAll(@Param("communityId", ParseUUIDPipe) communityId: string) {
    return this.projectsService.findAll(communityId);
  }

  @Get("projects/:projectId")
  @RequirePermissions(Permission.PROJECT_READ)
  findOne(@Param("projectId", ParseUUIDPipe) projectId: string) {
    return this.projectsService.findOne(projectId);
  }

  @Patch("projects/:projectId")
  @RequirePermissions(Permission.PROJECT_UPDATE)
  update(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(projectId, dto);
  }

  @Delete("projects/:projectId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROJECT_DELETE)
  async remove(@Param("projectId", ParseUUIDPipe) projectId: string) {
    await this.projectsService.remove(projectId);
  }
}
