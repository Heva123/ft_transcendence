import {
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessagesService } from "./messages.service";

describe("MessagesService", () => {
  const prisma = {
    channel: {
      findUnique: jest.fn(),
    },
    communityMember: {
      findUnique: jest.fn(),
    },
    block: {
      findMany: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    messageRead: {
      upsert: jest.fn(),
    },
  };

  let service: MessagesService;

  beforeEach(() => {
    jest.clearAllMocks();

    prisma.channel.findUnique.mockResolvedValue({
      id: "channel-1",
      communityId: "community-1",
    });

    prisma.communityMember.findUnique.mockResolvedValue({
      id: "membership-1",
    });

    prisma.block.findMany.mockResolvedValue([]);

    prisma.message.findMany.mockResolvedValue([]);
    prisma.message.count.mockResolvedValue(0);

    service = new MessagesService(
      prisma as unknown as PrismaService,
    );
  });

  it("rejects a user who is not a community member", async () => {
    prisma.communityMember.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      service.findAll("channel-1", "user-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns blocked users from both block directions", async () => {
    prisma.block.findMany.mockResolvedValue([
      {
        blockerId: "user-1",
        blockedId: "user-2",
      },
      {
        blockerId: "user-3",
        blockedId: "user-1",
      },
    ]);

    const result =
      await service.getBlockedUserIds("user-1");

    expect(result).toEqual([
      "user-2",
      "user-3",
    ]);
  });

  it("filters blocked users from message history", async () => {
    prisma.block.findMany.mockResolvedValue([
      {
        blockerId: "user-1",
        blockedId: "blocked-user",
      },
    ]);

    await service.findAll(
      "channel-1",
      "user-1",
    );

    expect(
      prisma.message.findMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          channelId: "channel-1",
          authorId: {
            notIn: ["blocked-user"],
          },
        },
      }),
    );
  });

  it("marks an existing message as read", async () => {
    prisma.message.findFirst.mockResolvedValue({
      id: "message-1",
    });

    prisma.messageRead.upsert.mockResolvedValue({
      messageId: "message-1",
      userId: "user-1",
      readAt: new Date(),
    });

    await service.markRead(
      "channel-1",
      "message-1",
      "user-1",
    );

    expect(
      prisma.messageRead.upsert,
    ).toHaveBeenCalledWith({
      where: {
        messageId_userId: {
          messageId: "message-1",
          userId: "user-1",
        },
      },
      update: {},
      create: {
        messageId: "message-1",
        userId: "user-1",
      },
      select: {
        messageId: true,
        userId: true,
        readAt: true,
      },
    });
  });

  it("rejects reading a message from another channel", async () => {
    prisma.message.findFirst.mockResolvedValue(
      null,
    );

    await expect(
      service.markRead(
        "channel-1",
        "wrong-message",
        "user-1",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("counts only unread messages from non-blocked users", async () => {
    prisma.block.findMany.mockResolvedValue([
      {
        blockerId: "user-1",
        blockedId: "blocked-user",
      },
    ]);

    prisma.message.count.mockResolvedValue(3);

    const result =
      await service.getUnreadCount(
        "channel-1",
        "user-1",
      );

    expect(
      prisma.message.count,
    ).toHaveBeenCalledWith({
      where: {
        channelId: "channel-1",
        authorId: {
          not: "user-1",
          notIn: ["blocked-user"],
        },
        reads: {
          none: {
            userId: "user-1",
          },
        },
      },
    });

    expect(result).toEqual({
      channelId: "channel-1",
      unreadCount: 3,
    });
  });
});
