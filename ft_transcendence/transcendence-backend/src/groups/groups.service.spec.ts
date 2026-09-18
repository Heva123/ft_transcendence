import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { GroupRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GroupsService } from "./groups.service";

describe("GroupsService", () => {
  const transactionClient = {
    group: { create: jest.fn() },
    member: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn(
      (callback: (tx: typeof transactionClient) => unknown) =>
        callback(transactionClient),
    ),
    group: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  let service: GroupsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GroupsService(prisma as unknown as PrismaService);
  });

  it("creates a group and makes its creator the owner in one transaction", async () => {
    transactionClient.group.create.mockResolvedValue({
      id: "group-id",
      name: "Backend Team",
      description: null,
      createdById: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    transactionClient.member.create.mockResolvedValue({ id: "member-id" });

    const result = await service.create("user-id", { name: "Backend Team" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.member.create).toHaveBeenCalledWith({
      data: {
        groupId: "group-id",
        userId: "user-id",
        role: GroupRole.OWNER,
      },
    });
    expect(result.currentUserRole).toBe(GroupRole.OWNER);
  });

  it("queries only groups containing the current user", async () => {
    prisma.group.findMany.mockResolvedValue([]);
    await service.findAllForUser("user-id");

    expect(prisma.group.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { members: { some: { userId: "user-id" } } },
      }),
    );
  });

  it("rejects access when the user is not a group member", async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: "group-id",
      members: [],
      _count: { members: 1 },
    });

    await expect(
      service.findOneForUser("outsider-id", "group-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns not found for a missing group", async () => {
    prisma.group.findUnique.mockResolvedValue(null);

    await expect(
      service.findOneForUser("user-id", "missing-id"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates a group after authorization", async () => {
    prisma.group.update.mockResolvedValue({
      id: "group-id",
      name: "Updated Team",
    });
    await service.update("group-id", { name: "Updated Team" });
    expect(prisma.group.update).toHaveBeenCalledWith({
      where: { id: "group-id" },
      data: { name: "Updated Team" },
    });
  });

  it("deletes a group after authorization", async () => {
    prisma.group.delete.mockResolvedValue({ id: "group-id" });
    await service.remove("group-id");
    expect(prisma.group.delete).toHaveBeenCalledWith({
      where: { id: "group-id" },
    });
  });
});
