import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GroupRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateGroupDto) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: dto.name,
          description: dto.description,
          createdById: userId,
        },
      });

      await tx.member.create({
        data: {
          groupId: group.id,
          userId,
          role: GroupRole.OWNER,
        },
      });

      return {
        ...group,
        currentUserRole: GroupRole.OWNER,
        memberCount: 1,
      };
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneForUser(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    if (group.members.length === 0) {
      throw new ForbiddenException("You do not have access to this group");
    }

    return group;
  }

  update(groupId: string, dto: UpdateGroupDto) {
    return this.prisma.group.update({ where: { id: groupId }, data: dto });
  }

  remove(groupId: string) {
    return this.prisma.group.delete({ where: { id: groupId } });
  }
}
