import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SiteRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { RealtimeEventsService } from "../realtime/realtime-events.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateAdminUserDto,
  ListAdminUsersDto,
  UpdateAdminUserDto,
} from "./dto/admin-user.dto";

export const ADMIN_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  bio: true,
  siteRole: true,
  createdAt: true,
  updatedAt: true,
  lastSeenAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeEventsService,
  ) {}

  async list(query: ListAdminUsersDto) {
    const { page, limit, q } = query;
    const where: Prisma.UserWhereInput = q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: ADMIN_USER_SELECT,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: ADMIN_USER_SELECT,
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async create(actorId: string, dto: CreateAdminUserDto) {
    const passwordHash = await hash(dto.password, 12);
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await this.requireActor(tx, actorId);
          return tx.user.create({
            data: {
              email: dto.email,
              username: dto.username,
              passwordHash,
              siteRole: dto.siteRole ?? SiteRole.USER,
            },
            select: ADMIN_USER_SELECT,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(actorId: string, id: string, dto: UpdateAdminUserDto) {
    if (
      actorId === id &&
      dto.siteRole !== undefined &&
      dto.siteRole !== SiteRole.ADMIN
    ) {
      throw new ForbiddenException(
        "Administrators cannot demote their own account",
      );
    }
    // Account fields are required in the database. Optional means omitted, not null.
    if (dto.email === null || dto.username === null)
      throw new BadRequestException("Email and username cannot be null");
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await this.requireActor(tx, actorId);
          const target = await tx.user.findUnique({
            where: { id },
            select: { siteRole: true },
          });
          if (!target) throw new NotFoundException("User not found");
          if (
            target.siteRole === SiteRole.ADMIN &&
            dto.siteRole !== undefined &&
            dto.siteRole !== SiteRole.ADMIN
          )
            await this.requireOtherAdmin(tx);
          return tx.user.update({
            where: { id },
            data: {
              ...(dto.email !== undefined ? { email: dto.email } : {}),
              ...(dto.username !== undefined ? { username: dto.username } : {}),
              ...(dto.siteRole !== undefined ? { siteRole: dto.siteRole } : {}),
              ...(dto.displayName !== undefined
                ? { displayName: dto.displayName || null }
                : {}),
              ...(dto.bio !== undefined ? { bio: dto.bio || null } : {}),
            },
            select: ADMIN_USER_SELECT,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.rethrow(error);
    }
  }

  async remove(actorId: string, id: string) {
    if (actorId === id)
      throw new ForbiddenException(
        "Administrators cannot delete their own account",
      );
    try {
      await this.prisma.$transaction(
        async (tx) => {
          await this.requireActor(tx, actorId);
          const target = await tx.user.findUnique({
            where: { id },
            select: { siteRole: true },
          });
          if (!target) throw new NotFoundException("User not found");
          if (target.siteRole === SiteRole.ADMIN)
            await this.requireOtherAdmin(tx);
          // Remove authored/owned content before User foreign keys with RESTRICT.
          // Other relations (memberships, friends, blocks, skills, messages) cascade.
          await tx.community.deleteMany({ where: { createdById: id } });
          await tx.channel.deleteMany({ where: { createdById: id } });
          await tx.project.deleteMany({ where: { createdById: id } });
          await tx.task.deleteMany({ where: { createdById: id } });
          await tx.comment.deleteMany({ where: { authorId: id } });
          await tx.post.deleteMany({ where: { authorId: id } });
          await tx.user.delete({ where: { id } });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      this.realtime.disconnectUser(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private async requireActor(tx: Prisma.TransactionClient, actorId: string) {
    const actor = await tx.user.findUnique({
      where: { id: actorId },
      select: { siteRole: true },
    });
    if (actor?.siteRole !== SiteRole.ADMIN)
      throw new ForbiddenException("Site administrator access is required");
  }

  private async requireOtherAdmin(tx: Prisma.TransactionClient) {
    if ((await tx.user.count({ where: { siteRole: SiteRole.ADMIN } })) <= 1)
      throw new ConflictException(
        "The final site administrator cannot be removed or demoted",
      );
  }

  private rethrow(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        throw new ConflictException("Email or username is already in use");
      if (error.code === "P2025") throw new NotFoundException("User not found");
      if (error.code === "P2034")
        throw new ConflictException(
          "Concurrent account change; retry the request",
        );
    }
    throw error;
  }
}
