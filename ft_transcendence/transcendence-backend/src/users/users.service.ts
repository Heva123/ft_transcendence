import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PUBLIC_USER_SELECT, toPublicUser } from "./user-profile";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findSafeById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  /** The signed-in user's own profile, including email. */
  async findMe(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { ...PUBLIC_USER_SELECT, email: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return { ...toPublicUser(user), email: user.email };
  }

  /**
   * Another member's profile as seen by `viewerId`: public fields,
   * friendship state, block state and communities the viewer may see.
   */
  async findPublicProfile(viewerId: string, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: PUBLIC_USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const [friendship, blocks, communities] = await Promise.all([
      this.prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: viewerId, addresseeId: user.id },
            { requesterId: user.id, addresseeId: viewerId },
          ],
        },
        select: { id: true, status: true, requesterId: true },
      }),
      this.prisma.block.findMany({
        where: {
          OR: [
            { blockerId: viewerId, blockedId: user.id },
            { blockerId: user.id, blockedId: viewerId },
          ],
        },
        select: { blockerId: true },
      }),
      this.prisma.community.findMany({
        where: {
          members: { some: { userId: user.id } },
          OR: [
            { isPublic: true },
            { members: { some: { userId: viewerId } } },
          ],
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    let status: "self" | "none" | "friends" | "outgoing" | "incoming" = "none";

    if (user.id === viewerId) status = "self";
    else if (friendship?.status === "ACCEPTED") status = "friends";
    else if (friendship) {
      status = friendship.requesterId === viewerId ? "outgoing" : "incoming";
    }

    return {
      ...toPublicUser(user),
      friendship: {
        status,
        requestId: friendship && friendship.status === "PENDING"
          ? friendship.id
          : null,
      },
      blockedByMe: blocks.some((block) => block.blockerId === viewerId),
      blocksMe: blocks.some((block) => block.blockerId === user.id),
      communities,
    };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException("You cannot block yourself");
    }

    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!blockedUser) {
      throw new NotFoundException("User not found");
    }

    // Blocking someone also ends any friendship or pending request.
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: blockerId, addresseeId: blockedId },
          { requesterId: blockedId, addresseeId: blockerId },
        ],
      },
    });

    const block = await this.prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
      update: {},
      create: {
        blockerId,
        blockedId,
      },
      select: {
        blockerId: true,
        blockedId: true,
        createdAt: true,
      },
    });

    return {
      ...block,
      blockedUser,
    };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });

    return {
      blockedId,
      blocked: false,
    };
  }

  async findBlockedUsers(blockerId: string) {
    return this.prisma.block.findMany({
      where: {
        blockerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        blocked: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const { skills, displayName, bio, ...account } = dto;

    if (dto.email || dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.username ? [{ username: dto.username }] : []),
          ],
        },
        select: { email: true, username: true },
      });

      if (existing?.email === dto.email)
        throw new ConflictException("Email is already in use");
      if (existing?.username === dto.username)
        throw new ConflictException("Username is already in use");
    }

    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          ...account,
          ...(displayName !== undefined ? { displayName: displayName || null } : {}),
          ...(bio !== undefined ? { bio: bio || null } : {}),
        },
        select: { id: true },
      });

      if (skills) {
        await this.replaceSkills(id, skills);
      }

      return await this.findMe(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email or username is already in use");
      }
      throw error;
    }
  }

  /*
    Skills are shared rows ("React" is stored once).
    Names match without case, so "react" reuses "React".
  */
  private async replaceSkills(userId: string, names: string[]) {
    // Keep the first spelling when the same skill is sent twice.
    const byKey = new Map<string, string>();

    for (const name of names.map((item) => item.trim()).filter(Boolean)) {
      if (!byKey.has(name.toLowerCase()))
        byKey.set(name.toLowerCase(), name);
    }
    const unique = [...byKey.values()];

    const skillIds: string[] = [];

    for (const name of unique) {
      const existing = await this.prisma.skill.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      });
      const skill = existing ?? await this.prisma.skill.create({
        data: { name },
        select: { id: true },
      });

      skillIds.push(skill.id);
    }

    await this.prisma.$transaction([
      this.prisma.userSkill.deleteMany({ where: { userId } }),
      this.prisma.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
        skipDuplicates: true,
      }),
    ]);
  }
}
