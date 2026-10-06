import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChatGateway } from "../messages/chat.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async findAll(userId: string) {
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      unreadCount,
    };
  }

  async create(
    userId: string,
    data: {
      type: string;
      title: string;
      message: string;
    },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    this.chatGateway.emitNotification(userId, notification);

    return notification;
  }

  async markRead(notificationId: string, userId: string) {
    const notification =
      await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });
  }
}
