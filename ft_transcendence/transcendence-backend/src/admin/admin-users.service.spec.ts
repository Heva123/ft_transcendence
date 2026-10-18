import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AdminUsersService } from "./admin-users.service";
import { RealtimeEventsService } from "../realtime/realtime-events.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AdminUsersService", () => {
  const user = {
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const tx = {
    user,
    community: { deleteMany: jest.fn() },
    channel: { deleteMany: jest.fn() },
    project: { deleteMany: jest.fn() },
    task: { deleteMany: jest.fn() },
    comment: { deleteMany: jest.fn() },
    post: { deleteMany: jest.fn() },
  };
  const prisma = { ...tx, $transaction: jest.fn() };
  const realtime = { disconnectUser: jest.fn() };
  const service = new AdminUsersService(
    prisma as unknown as PrismaService,
    realtime as unknown as RealtimeEventsService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(tx));
    user.findUnique.mockImplementation(({ where }) =>
      Promise.resolve({ siteRole: where.id === "admin" ? "ADMIN" : "USER" }),
    );
  });

  it("never selects password hashes for admin detail", async () => {
    await service.findOne("target");
    expect(user.findUnique.mock.calls[0][0].select).not.toHaveProperty(
      "passwordHash",
    );
  });

  it("rejects missing accounts", async () => {
    user.findUnique.mockResolvedValue(null);
    await expect(service.findOne("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("hashes admin-created account passwords and returns only safe fields", async () => {
    await service.create("admin", {
      username: "new_user",
      email: "new@example.com",
      password: "Testing12345",
      siteRole: "GUEST",
    });
    const args = user.create.mock.calls[0][0];
    expect(args.data.passwordHash).not.toBe("Testing12345");
    expect(args.data.passwordHash).toMatch(/^\$2/);
    expect(args.data.siteRole).toBe("GUEST");
    expect(args.select).not.toHaveProperty("passwordHash");
  });

  it("forbids self-demotion and self-deletion", async () => {
    await expect(
      service.update("admin", "admin", { siteRole: "USER" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove("admin", "admin")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rechecks actor permission inside the write transaction", async () => {
    user.findUnique.mockResolvedValue({ siteRole: "USER" });
    await expect(
      service.update("demoted", "target", { bio: "new" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(user.update).not.toHaveBeenCalled();
  });

  it("guards the final administrator", async () => {
    user.findUnique.mockResolvedValue({ siteRole: "ADMIN" });
    user.count.mockResolvedValue(1);
    await expect(
      service.update("admin", "other", { siteRole: "USER" }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(service.remove("admin", "other")).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(user.delete).not.toHaveBeenCalled();
  });

  it("removes owned content and account in one serializable transaction", async () => {
    await service.remove("admin", "target");
    expect(tx.community.deleteMany).toHaveBeenCalledWith({
      where: { createdById: "target" },
    });
    expect(tx.comment.deleteMany).toHaveBeenCalledWith({
      where: { authorId: "target" },
    });
    expect(user.delete).toHaveBeenCalledWith({ where: { id: "target" } });
    expect(realtime.disconnectUser).toHaveBeenCalledWith("target");
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: "Serializable",
    });
  });

  it("maps concurrent writes to a retryable conflict", async () => {
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("conflict", {
        code: "P2034",
        clientVersion: "6",
      }),
    );
    await expect(service.remove("admin", "target")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
