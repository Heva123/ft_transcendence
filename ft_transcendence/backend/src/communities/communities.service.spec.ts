import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommunityRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CommunitiesService } from "./communities.service";

jest.mock("../messages/chat.gateway", () => ({
  ChatGateway: class ChatGateway {},
}));

describe("CommunitiesService", () => {
  const transactionClient = {
    community: { create: jest.fn() },
    communityMember: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn(
      (callback: (tx: typeof transactionClient) => unknown) =>
        callback(transactionClient),
    ),
    community: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    communityMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const messages = {
    getBlockedUserIds: jest.fn(),
  };

  const notifications = {
    create: jest.fn(),
  };

  let service: CommunitiesService;

  beforeEach(() => {
    jest.clearAllMocks();

    messages.getBlockedUserIds.mockResolvedValue([]);
    notifications.create.mockResolvedValue({});
    prisma.communityMember.findMany.mockResolvedValue([]);
    prisma.user.findUnique.mockResolvedValue({
      username: "test_user",
    });

    service = new CommunitiesService(
      prisma as unknown as PrismaService,
      notifications as any,
      messages as any,
    );
  });

  it("creates a community and makes its creator the owner in one transaction", async () => {
    transactionClient.community.create.mockResolvedValue({
      id: "community-id",
      name: "Backend Team",
      description: null,
      createdById: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    transactionClient.communityMember.create.mockResolvedValue({
      id: "communityMember-id",
    });

    const result = await service.create("user-id", { name: "Backend Team" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.communityMember.create).toHaveBeenCalledWith({
      data: {
        communityId: "community-id",
        userId: "user-id",
        role: CommunityRole.OWNER,
      },
    });
    expect(result.currentUserRole).toBe(CommunityRole.OWNER);
  });

  it("queries only communities containing the current user", async () => {
    prisma.community.findMany.mockResolvedValue([]);
    await service.findAllForUser("user-id");

    expect(prisma.community.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { members: { some: { userId: "user-id" } } },
      }),
    );
  });

  it("rejects access when the user is not a community communityMember", async () => {
    prisma.community.findUnique.mockResolvedValue({
      id: "community-id",
      members: [],
      _count: { members: 1 },
    });

    await expect(
      service.findOneForUser("outsider-id", "community-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns not found for a missing community", async () => {
    prisma.community.findUnique.mockResolvedValue(null);

    await expect(
      service.findOneForUser("user-id", "missing-id"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates a community after authorization", async () => {
    prisma.community.update.mockResolvedValue({
      id: "community-id",
      name: "Updated Team",
    });
    await service.update(
      "user-id",
      "community-id",
      { name: "Updated Team" },
    );
    expect(prisma.community.update).toHaveBeenCalledWith({
      where: { id: "community-id" },
      data: { name: "Updated Team" },
    });
  });

  it("deletes a community after authorization", async () => {
    prisma.community.findUnique.mockResolvedValue({
      name: "Backend Team",
    });
    prisma.community.delete.mockResolvedValue({ id: "community-id" });

    await service.remove("user-id", "community-id");
    expect(prisma.community.delete).toHaveBeenCalledWith({
      where: { id: "community-id" },
    });
  });

  it("lists public communities the user has not joined", async () => {
    prisma.community.findMany.mockResolvedValue([]);
    await service.discover("user-id");
    expect(prisma.community.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublic: true, members: { none: { userId: "user-id" } } },
      }),
    );
  });

  it("allows a user to join a public community", async () => {
    prisma.community.findUnique.mockResolvedValue({
      id: "community-id",
      isPublic: true,
    });
    prisma.communityMember.findUnique.mockResolvedValue(null);
    prisma.communityMember.create.mockResolvedValue({
      id: "membership-id",
      role: CommunityRole.MEMBER,
    });

    const result = await service.join("user-id", "community-id");
    expect(result.role).toBe(CommunityRole.MEMBER);
  });

  it("prevents an owner from leaving their community", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      id: "membership-id",
      role: CommunityRole.OWNER,
    });
    await expect(
      service.leave("owner-id", "community-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
