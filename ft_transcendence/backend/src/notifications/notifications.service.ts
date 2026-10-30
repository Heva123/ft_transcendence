import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChatGateway } from "../messages/chat.gateway";

const NOTIFICATION_SELECT = {
  id: true,
  type: true,
  title: true,
  message: true,
  link: true,
  isRead: true,
  readAt: true,
  createdAt: true,
} as const;

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
        select: NOTIFICATION_SELECT,
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
      /** App path the "View" button opens, e.g. /profile/heba. */
      link?: string;
    },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link ?? null,
      },
      select: NOTIFICATION_SELECT,
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
        select: NOTIFICATION_SELECT,
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
      select: NOTIFICATION_SELECT,
    });
  }
}
