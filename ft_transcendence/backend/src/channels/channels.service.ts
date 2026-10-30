import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MessagesService } from "../messages/messages.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messages: MessagesService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(communityId: string) {
    return this.prisma.channel.findMany({
      where: { communityId },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    });
  }

  async create(
    communityId: string,
    createdById: string,
    dto: CreateChannelDto,
  ) {
    try {
      const channel = await this.prisma.channel.create({
        data: { ...dto, communityId, createdById },
      });

      await this.notifyChannelCreated(
        createdById,
        communityId,
        channel.id,
        channel.name,
      );

      return channel;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A channel with this name already exists");
      }
      throw error;
    }
  }

  private async notifyChannelCreated(
    actorId: string,
    communityId: string,
    channelId: string,
    channelName: string,
  ) {
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
          type: "CHANNEL_CREATED",
          title: "Channel created",
          message: `${channelName} channel was created.`,
          link: `/channels/${channelId}`,
        }),
      ),
    );
  }

  async findOne(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException("Channel not found");
    return channel;
  }

  async update(
    actorId: string,
    channelId: string,
    dto: UpdateChannelDto,
  ) {
    const existing = await this.findOne(channelId);

    try {
      const updated = await this.prisma.channel.update({
        where: { id: channelId },
        data: dto,
      });

      await this.notifyChannelUpdated(
        actorId,
        existing.communityId,
        channelId,
        updated.name,
      );

      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A channel with this name already exists");
      }
      throw error;
    }
  }

  private async notifyChannelUpdated(
    actorId: string,
    communityId: string,
    channelId: string,
    channelName: string,
  ) {
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
          type: "CHANNEL_UPDATED",
          title: "Channel updated",
          message: `${channelName} channel was updated.`,
          link: `/channels/${channelId}`,
        }),
      ),
    );
  }

  async remove(
    actorId: string,
    channelId: string,
  ) {
    const channel = await this.findOne(channelId);

    const blockedUserIds =
      await this.messages.getBlockedUserIds(actorId);

    const members = await this.prisma.communityMember.findMany({
      where: {
        communityId: channel.communityId,
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await this.prisma.channel.delete({
      where: { id: channelId },
    });

    await Promise.all(
      members.map((member) =>
        this.notifications.create(member.userId, {
          type: "CHANNEL_DELETED",
          title: "Channel deleted",
          message: `${channel.name} channel was deleted.`,
          link: `/communities/${channel.communityId}`,
        }),
      ),
    );
  }
}
