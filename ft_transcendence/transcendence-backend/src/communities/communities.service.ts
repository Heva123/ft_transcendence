import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommunityRole, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommunityDto } from "./dto/create-community.dto";
import { UpdateCommunityDto } from "./dto/update-community.dto";

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateCommunityDto) {
    return this.prisma.$transaction(async (tx) => {
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
      return await this.prisma.communityMember.create({
        data: { userId, communityId, role: CommunityRole.MEMBER },
        select: { id: true, role: true, joinedAt: true, communityId: true },
      });
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

    await this.prisma.communityMember.delete({ where: { id: membership.id } });
  }

  update(communityId: string, dto: UpdateCommunityDto) {
    return this.prisma.community.update({
      where: { id: communityId },
      data: dto,
    });
  }

  remove(communityId: string) {
    return this.prisma.community.delete({ where: { id: communityId } });
  }
}
