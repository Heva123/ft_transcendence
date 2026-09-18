import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthUser } from "../../common/types/auth-user.type";
import { PrismaService } from "../../prisma/prisma.service";
import { roleHasPermissions } from "../../roles/role-permissions";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { Permission } from "../permission.enum";

type GroupRequest = {
  user: AuthUser;
  params: { groupId?: string; projectId?: string; taskId?: string };
};

@Injectable()
export class GroupPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest<GroupRequest>();
    const groupId = await this.resolveGroupId(request.params);

    if (!groupId) {
      throw new ForbiddenException("Group context is required");
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) throw new NotFoundException("Group not found");

    const membership = await this.prisma.member.findUnique({
      where: { userId_groupId: { userId: request.user.id, groupId } },
      select: { role: true },
    });

    if (
      !membership ||
      !roleHasPermissions(membership.role, requiredPermissions)
    ) {
      throw new ForbiddenException(
        "You do not have permission to perform this action",
      );
    }

    return true;
  }

  private async resolveGroupId(params: GroupRequest["params"]) {
    if (params.groupId) {
      const group = await this.prisma.group.findUnique({
        where: { id: params.groupId },
        select: { id: true },
      });
      if (!group) throw new NotFoundException("Group not found");
      return group.id;
    }

    if (params.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: params.projectId },
        select: { groupId: true },
      });
      if (!project) throw new NotFoundException("Project not found");
      return project.groupId;
    }

    if (params.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: params.taskId },
        select: { project: { select: { groupId: true } } },
      });
      if (!task) throw new NotFoundException("Task not found");
      return task.project.groupId;
    }

    throw new ForbiddenException("Group context is required");
  }
}
