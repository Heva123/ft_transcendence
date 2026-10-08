import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async requireChannelMember(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: {
        id: true,
        communityId: true,
      },
    });

    if (!channel) {
      throw new NotFoundException("Channel not found");
    }

    const membership = await this.prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: channel.communityId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException(
        "You must be a community member to access this channel",
      );
    }
  }

  async getBlockedUserIds(userId: string) {
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId },
          { blockedId: userId },
        ],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    return blocks.map((block) =>
      block.blockerId === userId
        ? block.blockedId
        : block.blockerId,
    );
  }

  async findAll(channelId: string, userId: string) {
    await this.requireChannelMember(channelId, userId);

    const blockedUserIds =
      await this.getBlockedUserIds(userId);

    return this.prisma.message.findMany({
      where: {
        channelId,
        authorId: {
          notIn: blockedUserIds,
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        channelId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async markRead(
    channelId: string,
    messageId: string,
    userId: string,
  ) {
    await this.requireChannelMember(channelId, userId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        channelId,
      },
      select: {
        id: true,
      },
    });

    if (!message) {
      throw new NotFoundException(
        "Message not found in this channel",
      );
    }

    return this.prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {},
      create: {
        messageId,
        userId,
      },
      select: {
        messageId: true,
        userId: true,
        readAt: true,
      },
    });
  }

  async getUnreadCount(channelId: string, userId: string) {
    await this.requireChannelMember(channelId, userId);

    const blockedUserIds =
      await this.getBlockedUserIds(userId);

    const unreadCount = await this.prisma.message.count({
      where: {
        channelId,
        authorId: {
          not: userId,
          notIn: blockedUserIds,
        },
        reads: {
          none: {
            userId,
          },
        },
      },
    });

    return {
      channelId,
      unreadCount,
    };
  }

  async create(
    channelId: string,
    authorId: string,
    dto: CreateMessageDto,
  ) {
    await this.requireChannelMember(channelId, authorId);

    return this.prisma.message.create({
      data: {
        channelId,
        authorId,
        content: dto.content,
      },
      select: {
        id: true,
        channelId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}
