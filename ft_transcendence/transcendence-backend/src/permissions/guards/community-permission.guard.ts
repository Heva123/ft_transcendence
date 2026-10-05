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

type CommunityRequest = {
  user: AuthUser;
  params: {
    communityId?: string;
    projectId?: string;
    taskId?: string;
    channelId?: string;
  };
};

@Injectable()
export class CommunityPermissionGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest<CommunityRequest>();
    const communityId = await this.resolveCommunityId(request.params);

    if (!communityId) {
      throw new ForbiddenException("Community context is required");
    }

    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });

    if (!community) throw new NotFoundException("Community not found");

    const communityMembership = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: request.user.id, communityId } },
      select: { role: true },
    });

    if (
      !communityMembership ||
      !roleHasPermissions(communityMembership.role, requiredPermissions)
    ) {
      throw new ForbiddenException(
        "You do not have permission to perform this action",
      );
    }

    return true;
  }

  private async resolveCommunityId(params: CommunityRequest["params"]) {
    if (params.communityId) {
      const community = await this.prisma.community.findUnique({
        where: { id: params.communityId },
        select: { id: true },
      });
      if (!community) throw new NotFoundException("Community not found");
      return community.id;
    }

    if (params.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: params.projectId },
        select: { communityId: true },
      });
      if (!project) throw new NotFoundException("Project not found");
      return project.communityId;
    }

    if (params.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: params.taskId },
        select: { project: { select: { communityId: true } } },
      });
      if (!task) throw new NotFoundException("Task not found");
      return task.project.communityId;
    }

    if (params.channelId) {
      const channel = await this.prisma.channel.findUnique({
        where: { id: params.channelId },
        select: { communityId: true },
      });
      if (!channel) throw new NotFoundException("Channel not found");
      return channel.communityId;
    }

    throw new ForbiddenException("Community context is required");
  }
}
