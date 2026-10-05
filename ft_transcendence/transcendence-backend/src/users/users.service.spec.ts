import { ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  const prisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it("returns only safe user fields when updating a profile", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue({
      id: "user-id",
      email: "new@example.com",
      username: "new_name",
    });
    await service.update("user-id", {
      email: "new@example.com",
      username: "new_name",
    });
    const updateArguments = prisma.user.update.mock.calls[0][0];
    expect(updateArguments.select).toEqual({
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    });
    expect(updateArguments.select).not.toHaveProperty("passwordHash");
  });

  it("rejects an email used by another account", async () => {
    prisma.user.findFirst.mockResolvedValue({
      email: "used@example.com",
      username: "someone",
    });
    await expect(
      service.update("user-id", { email: "used@example.com" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
