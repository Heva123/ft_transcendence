// The real service pulls in the socket gateway, which unit tests do not need.
jest.mock("../notifications/notifications.service", () => ({
  NotificationsService: class NotificationsService {},
}));

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import type { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { FriendsService } from "./friends.service";

const person = (id: string, username: string) => ({
  id,
  username,
  displayName: null,
  bio: null,
  avatarPath: null,
  lastSeenAt: null,
  createdAt: new Date(),
  skills: [],
});

describe("FriendsService", () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    block: { findFirst: jest.fn() },
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const notifications = { create: jest.fn() };
  let service: FriendsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FriendsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
    prisma.user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.id === "a"
          ? { id: "a", username: "afnan" }
          : { id: "b", username: "heba" },
      ),
    );
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.friendship.findFirst.mockResolvedValue(null);
  });

  it("rejects a request to yourself", async () => {
    await expect(service.sendRequest("a", "a")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects a request when either user blocked the other", async () => {
    prisma.block.findFirst.mockResolvedValue({ blockerId: "b" });
    await expect(service.sendRequest("a", "b")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.friendship.create).not.toHaveBeenCalled();
  });

  it("creates a pending request and notifies the other user", async () => {
    prisma.friendship.create.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      createdAt: new Date(),
    });
    await service.sendRequest("a", "b");
    expect(prisma.friendship.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { requesterId: "a", addresseeId: "b" },
      }),
    );
    expect(notifications.create).toHaveBeenCalledWith(
      "b",
      expect.objectContaining({ type: "FRIEND_REQUEST", link: "/friends" }),
    );
  });

  it("does not send a second request in the same direction", async () => {
    prisma.friendship.findFirst.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      requesterId: "a",
    });
    await expect(service.sendRequest("a", "b")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("accepts the other user's pending request instead of creating a duplicate", async () => {
    prisma.friendship.findFirst.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      requesterId: "b",
    });
    prisma.friendship.findUnique.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      requesterId: "b",
      addresseeId: "a",
    });
    prisma.friendship.update.mockResolvedValue({
      id: "f1",
      status: "ACCEPTED",
      respondedAt: new Date(),
      createdAt: new Date(),
      requesterId: "b",
      addresseeId: "a",
      requester: person("b", "heba"),
      addressee: person("a", "afnan"),
    });
    const result = await service.sendRequest("a", "b");
    expect(prisma.friendship.create).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: "ACCEPTED",
      user: { username: "heba" },
    });
    expect(notifications.create).toHaveBeenCalledWith(
      "b",
      expect.objectContaining({ type: "FRIEND_ACCEPTED" }),
    );
  });

  it("only lets the receiver accept a request", async () => {
    prisma.friendship.findUnique.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      requesterId: "a",
      addresseeId: "b",
    });
    await expect(service.accept("a", "f1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("removing a non-friend is a 404", async () => {
    prisma.friendship.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.removeFriend("a", "b")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it("rejects accepting a request when either user blocked the other", async () => {
    prisma.friendship.findUnique.mockResolvedValue({
      id: "f1",
      status: "PENDING",
      requesterId: "a",
      addresseeId: "b",
    });
    prisma.block.findFirst.mockResolvedValue({ blockerId: "b" });
    await expect(service.accept("b", "f1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.friendship.update).not.toHaveBeenCalled();
    expect(notifications.create).not.toHaveBeenCalled();
  });
});
