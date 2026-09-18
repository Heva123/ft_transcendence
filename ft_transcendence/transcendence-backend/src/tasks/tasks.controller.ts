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
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { GroupPermissionGuard } from "../permissions/guards/group-permission.guard";
import { Permission } from "../permissions/permission.enum";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { TasksService } from "./tasks.service";

@UseGuards(JwtAuthGuard, GroupPermissionGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post("projects/:projectId/tasks")
  @RequirePermissions(Permission.TASK_CREATE)
  create(
    @CurrentUser() user: AuthUser,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.id, projectId, dto);
  }

  @Get("projects/:projectId/tasks")
  @RequirePermissions(Permission.TASK_READ)
  findAll(
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.findAll(projectId, query);
  }

  @Get("tasks/:taskId")
  @RequirePermissions(Permission.TASK_READ)
  findOne(@Param("taskId", ParseUUIDPipe) taskId: string) {
    return this.tasksService.findOne(taskId);
  }

  @Patch("tasks/:taskId")
  @RequirePermissions(Permission.TASK_UPDATE)
  update(
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, dto);
  }

  @Patch("tasks/:taskId/status")
  @RequirePermissions(Permission.TASK_UPDATE)
  updateStatus(
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(taskId, dto);
  }

  @Delete("tasks/:taskId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TASK_DELETE)
  async remove(@Param("taskId", ParseUUIDPipe) taskId: string) {
    await this.tasksService.remove(taskId);
  }
}
