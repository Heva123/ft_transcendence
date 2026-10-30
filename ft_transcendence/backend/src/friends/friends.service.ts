import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { PUBLIC_USER_SELECT, toPublicUser } from "../users/user-profile";

const REQUEST_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  respondedAt: true,
  requesterId: true,
  addresseeId: true,
  requester: { select: PUBLIC_USER_SELECT },
  addressee: { select: PUBLIC_USER_SELECT },
} as const;

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Accepted friends of a user, newest first. */
  async findFriends(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      orderBy: { respondedAt: "desc" },
      select: REQUEST_SELECT,
    });

    return rows.map((row) => ({
      id: row.id,
      since: row.respondedAt ?? row.createdAt,
      user: toPublicUser(
        row.requesterId === userId ? row.addressee : row.requester,
      ),
    }));
  }

  /** Pending requests sent to me (incoming) and by me (outgoing). */
  async findRequests(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: "PENDING",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      orderBy: { createdAt: "desc" },
      select: REQUEST_SELECT,
    });

    return {
      incoming: rows
        .filter((row) => row.addresseeId === userId)
        .map((row) => ({
          id: row.id,
          createdAt: row.createdAt,
          user: toPublicUser(row.requester),
        })),
      outgoing: rows
        .filter((row) => row.requesterId === userId)
        .map((row) => ({
          id: row.id,
          createdAt: row.createdAt,
          user: toPublicUser(row.addressee),
        })),
    };
  }

  /*
    Sends a request. If the other person already sent one to me,
    this accepts theirs instead of creating a second row.
  */
  async sendRequest(userId: string, targetId: string) {
    if (userId === targetId) {
      throw new BadRequestException("You cannot add yourself as a friend");
    }

    const [target, me] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true, username: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      }),
    ]);

    if (!target || !me) {
      throw new NotFoundException("User not found");
    }

    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetId },
          { blockerId: targetId, blockedId: userId },
        ],
      },
      select: { blockerId: true },
    });

    if (block) {
      throw new ForbiddenException("You cannot add this user as a friend");
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId },
        ],
      },
      select: { id: true, status: true, requesterId: true },
    });

    if (existing?.status === "ACCEPTED") {
      throw new ConflictException("You are already friends");
    }
    if (existing && existing.requesterId === userId) {
      throw new ConflictException("Friend request already sent");
    }
    if (existing) {
      return this.accept(userId, existing.id);
    }

    const request = await this.prisma.friendship.create({
      data: { requesterId: userId, addresseeId: targetId },
      select: { id: true, status: true, createdAt: true },
    });

    await this.notifications.create(targetId, {
      type: "FRIEND_REQUEST",
      title: `${me.username} wants to be friends`,
      message: "Accept or decline in Friends.",
      link: "/friends",
    });

    return { ...request, user: target };
  }

  /** Only the person who received the request can accept it. */
  async accept(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
      select: { id: true, status: true, requesterId: true, addresseeId: true },
    });

    if (!request || request.addresseeId !== userId) {
      throw new NotFoundException("Friend request not found");
    }
    if (request.status === "ACCEPTED") {
      throw new ConflictException("You are already friends");
    }

    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: request.requesterId },
          { blockerId: request.requesterId, blockedId: userId },
        ],
      },
      select: { blockerId: true },
    });
    if (block) {
      throw new ForbiddenException("You cannot add this user as a friend");
    }

    const updated = await this.prisma.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
      select: REQUEST_SELECT,
    });

    await this.notifications.create(request.requesterId, {
      type: "FRIEND_ACCEPTED",
      title: `${updated.addressee.username} joined your circle`,
      message: "You are now friends.",
      link: `/profile/${updated.addressee.username}`,
    });

    return {
      id: updated.id,
      status: updated.status,
      since: updated.respondedAt,
      user: toPublicUser(updated.requester),
    };
  }

  /** Decline an incoming request or cancel an outgoing one. */
  async removeRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
      select: { status: true, requesterId: true, addresseeId: true },
    });

    if (
      !request ||
      request.status !== "PENDING" ||
      (request.requesterId !== userId && request.addresseeId !== userId)
    ) {
      throw new NotFoundException("Friend request not found");
    }

    await this.prisma.friendship.delete({ where: { id: requestId } });
  }

  /** Remove an accepted friend. Either side can do this. */
  async removeFriend(userId: string, friendId: string) {
    const result = await this.prisma.friendship.deleteMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
      },
    });

    if (!result.count) {
      throw new NotFoundException("You are not friends with this user");
    }
  }
}
