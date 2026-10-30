import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommunityRole, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { MessagesService } from "../messages/messages.service";
import { CreateCommunityDto } from "./dto/create-community.dto";
import { UpdateCommunityDto } from "./dto/update-community.dto";

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly messages: MessagesService,
  ) {}

  async create(userId: string, dto: CreateCommunityDto) {
    const created = await this.prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          name: dto.name,
          description: dto.description,
          isPublic: dto.isPublic,
          createdById: userId,
        },
      });

      await tx.communityMember.create({
        data: {
          communityId: community.id,
          userId,
          role: CommunityRole.OWNER,
        },
      });

      return {
        ...community,
        currentUserRole: CommunityRole.OWNER,
        memberCount: 1,
      };
    });

    await this.notifications.create(userId, {
      type: "COMMUNITY_CREATED",
      title: "Community created",
      message: `${created.name} was created successfully.`,
      link: `/communities/${created.id}`,
    });

    return created;
  }

  findAllForUser(userId: string) {
    return this.prisma.community.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { members: true, channels: true, projects: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneForUser(userId: string, communityId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: {
        _count: { select: { members: true, channels: true, projects: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!community) {
      throw new NotFoundException("Community not found");
    }

    if (community.members.length === 0) {
      throw new ForbiddenException("You do not have access to this community");
    }

    return community;
  }

  discover(userId: string) {
    return this.prisma.community.findMany({
      where: {
        isPublic: true,
        members: { none: { userId } },
      },
      include: {
        _count: { select: { members: true, channels: true, projects: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async join(userId: string, communityId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, isPublic: true },
    });

    if (!community) throw new NotFoundException("Community not found");
    if (!community.isPublic) {
      throw new ForbiddenException("This community requires an invitation");
    }

    const existing = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
      select: { id: true },
    });
    if (existing) throw new ConflictException("You are already a member");

    try {
      const membership = await this.prisma.communityMember.create({
        data: { userId, communityId, role: CommunityRole.MEMBER },
        select: { id: true, role: true, joinedAt: true, communityId: true },
      });

      await this.notifyMemberJoined(userId, communityId);

      return membership;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("You are already a member");
      }
      throw error;
    }
  }

  private async notifyMemberJoined(
    actorId: string,
    communityId: string,
  ) {
    const [actor, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (!actor) return;

    const managers = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        role: {
          in: [
            CommunityRole.OWNER,
            CommunityRole.ADMIN,
          ],
        },
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      managers.map((member) =>
        this.notifications.create(member.userId, {
          type: "MEMBER_JOINED",
          title: "Member joined",
          message: `${actor.username} joined the community.`,
          link: `/communities/${communityId}/members`,
        }),
      ),
    );
  }

  async leave(userId: string, communityId: string) {
    const membership = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
      select: { id: true, role: true },
    });

    if (!membership)
      throw new NotFoundException("Community membership not found");
    if (membership.role === CommunityRole.OWNER) {
      throw new ForbiddenException(
        "The owner must transfer ownership or delete the community",
      );
    }

    await this.prisma.communityMember.delete({
      where: { id: membership.id },
    });

    await this.notifyMemberLeft(userId, communityId);
  }

  private async notifyMemberLeft(
    actorId: string,
    communityId: string,
  ) {
    const [actor, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (!actor) return;

    const managers = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        role: {
          in: [
            CommunityRole.OWNER,
            CommunityRole.ADMIN,
          ],
        },
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      managers.map((member) =>
        this.notifications.create(member.userId, {
          type: "MEMBER_LEFT",
          title: "Member left",
          message: `${actor.username} left the community.`,
          link: `/communities/${communityId}/members`,
        }),
      ),
    );
  }

  async update(
    actorId: string,
    communityId: string,
    dto: UpdateCommunityDto,
  ) {
    const updated = await this.prisma.community.update({
      where: { id: communityId },
      data: dto,
    });

    const blockedUserIds =
      await this.messages.getBlockedUserIds(actorId);

    const members = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      members.map((member) =>
        this.notifications.create(member.userId, {
          type: "COMMUNITY_UPDATED",
          title: "Community updated",
          message: `${updated.name} was updated.`,
          link: `/communities/${communityId}`,
        }),
      ),
    );

    return updated;
  }

  async remove(
    actorId: string,
    communityId: string,
  ) {
    const [community, blockedUserIds] = await Promise.all([
      this.prisma.community.findUnique({
        where: { id: communityId },
        select: { name: true },
      }),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const members = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await this.prisma.community.delete({
      where: { id: communityId },
    });

    await Promise.all(
      members.map((member) =>
        this.notifications.create(member.userId, {
          type: "COMMUNITY_DELETED",
          title: "Community deleted",
          message: `${community.name} was deleted.`,
          link: "/communities",
        }),
      ),
    );
  }
}
