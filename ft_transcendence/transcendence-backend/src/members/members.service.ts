import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GroupRole, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddMemberDto } from "./dto/add-member.dto";
import { ChangeMemberRoleDto } from "./dto/change-member-role.dto";

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUserId: string, groupId: string) {
    await this.requireMembership(currentUserId, groupId);

    return this.prisma.member.findMany({
      where: { groupId },
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

  async add(currentUserId: string, groupId: string, dto: AddMemberDto) {
    const currentMember = await this.requireMembership(currentUserId, groupId);

    if (
      currentMember.role === GroupRole.ADMIN &&
      dto.role === GroupRole.ADMIN
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
      return await this.prisma.member.create({
        data: {
          groupId,
          userId: userToAdd.id,
          role: dto.role ?? GroupRole.MEMBER,
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
        throw new ConflictException("User is already a member of this group");
      }

      throw error;
    }
  }

  async changeRole(
    groupId: string,
    memberId: string,
    dto: ChangeMemberRoleDto,
  ) {
    const member = await this.findMemberInGroup(groupId, memberId);

    if (member.role === GroupRole.OWNER) {
      throw new ForbiddenException("The owner role cannot be changed");
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: { role: dto.role },
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, email: true, username: true } },
      },
    });
  }

  async remove(groupId: string, memberId: string) {
    const member = await this.findMemberInGroup(groupId, memberId);

    if (member.role === GroupRole.OWNER) {
      throw new ForbiddenException("The group owner cannot be removed");
    }

    await this.prisma.member.delete({ where: { id: memberId } });
  }

  private async findMemberInGroup(groupId: string, memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, groupId: true, role: true },
    });

    if (!member || member.groupId !== groupId) {
      throw new NotFoundException("Member not found in this group");
    }

    return member;
  }

  private async requireMembership(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    const membership = await this.prisma.member.findUnique({
      where: { userId_groupId: { userId, groupId } },
      select: { id: true, role: true },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this group");
    }

    return membership;
  }
}
