import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommunityRole, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddCommunityMemberDto } from "./dto/add-member.dto";
import { ChangeCommunityMemberRoleDto } from "./dto/change-member-role.dto";

@Injectable()
export class CommunityMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUserId: string, communityId: string) {
    await this.requireCommunityMembership(currentUserId, communityId);

    return this.prisma.communityMember.findMany({
      where: { communityId },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async add(
    currentUserId: string,
    communityId: string,
    dto: AddCommunityMemberDto,
  ) {
    const currentCommunityMember = await this.requireCommunityMembership(
      currentUserId,
      communityId,
    );

    if (
      dto.role === CommunityRole.ADMIN &&
      currentCommunityMember.role !== CommunityRole.OWNER
    ) {
      throw new ForbiddenException("Only owners can add administrators");
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, username: true },
    });

    if (!userToAdd) {
      throw new NotFoundException("No registered user has this email");
    }

    try {
      return await this.prisma.communityMember.create({
        data: {
          communityId,
          userId: userToAdd.id,
          role: dto.role ?? CommunityRole.MEMBER,
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            select: { id: true, email: true, username: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "User is already a member of this community",
        );
      }

      throw error;
    }
  }

  async changeRole(
    currentUserId: string,
    communityId: string,
    communityMemberId: string,
    dto: ChangeCommunityMemberRoleDto,
  ) {
    const actor = await this.requireCommunityMembership(
      currentUserId,
      communityId,
    );
    const communityMember = await this.findCommunityMemberInCommunity(
      communityId,
      communityMemberId,
    );

    if (communityMember.role === CommunityRole.OWNER) {
      throw new ForbiddenException("The owner role cannot be changed");
    }
    if (
      (communityMember.role === CommunityRole.ADMIN ||
        dto.role === CommunityRole.ADMIN) &&
      actor.role !== CommunityRole.OWNER
    ) {
      throw new ForbiddenException("Only owners can manage administrators");
    }

    return this.prisma.communityMember.update({
      where: { id: communityMemberId },
      data: { role: dto.role },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, email: true, username: true } },
      },
    });
  }

  async remove(
    currentUserId: string,
    communityId: string,
    communityMemberId: string,
  ) {
    const actor = await this.requireCommunityMembership(
      currentUserId,
      communityId,
    );
    const communityMember = await this.findCommunityMemberInCommunity(
      communityId,
      communityMemberId,
    );

    if (communityMember.role === CommunityRole.OWNER) {
      throw new ForbiddenException("The community owner cannot be removed");
    }
    if (
      communityMember.role === CommunityRole.ADMIN &&
      actor.role !== CommunityRole.OWNER
    ) {
      throw new ForbiddenException("Only owners can remove administrators");
    }
    if (
      actor.role === CommunityRole.MODERATOR &&
      communityMember.role !== CommunityRole.MEMBER
    ) {
      throw new ForbiddenException("Moderators can only remove members");
    }

    await this.prisma.communityMember.delete({
      where: { id: communityMemberId },
    });
  }

  private async findCommunityMemberInCommunity(
    communityId: string,
    communityMemberId: string,
  ) {
    const communityMember = await this.prisma.communityMember.findUnique({
      where: { id: communityMemberId },
      select: { id: true, communityId: true, role: true },
    });

    if (!communityMember || communityMember.communityId !== communityId) {
      throw new NotFoundException("Member not found in this community");
    }

    return communityMember;
  }

  private async requireCommunityMembership(
    userId: string,
    communityId: string,
  ) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });

    if (!community) {
      throw new NotFoundException("Community not found");
    }

    const communityMembership = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
      select: { id: true, role: true },
    });

    if (!communityMembership) {
      throw new ForbiddenException("You do not have access to this community");
    }

    return communityMembership;
  }
}
