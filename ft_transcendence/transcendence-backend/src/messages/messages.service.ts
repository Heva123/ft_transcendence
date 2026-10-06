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

  async findAll(channelId: string, userId: string) {
    await this.requireChannelMember(channelId, userId);

    return this.prisma.message.findMany({
      where: { channelId },
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
