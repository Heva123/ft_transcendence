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

  it("never returns the password hash when updating a profile", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue({ id: "user-id" });
    prisma.user.findUnique.mockResolvedValue({
      id: "user-id",
      email: "new@example.com",
      username: "new_name",
      displayName: null,
      bio: null,
      avatarPath: null,
      lastSeenAt: null,
      createdAt: new Date(),
      skills: [],
    });
    const result = await service.update("user-id", {
      email: "new@example.com",
      username: "new_name",
    });
    const readArguments = prisma.user.findUnique.mock.calls[0][0];
    expect(readArguments.select).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).toMatchObject({ username: "new_name", avatarUrl: null, skills: [] });
  });

  it("clears display name and bio when sent as empty strings", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.update.mockResolvedValue({ id: "user-id" });
    prisma.user.findUnique.mockResolvedValue({
      id: "user-id", email: "e@example.com", username: "u", displayName: null, bio: null,
      avatarPath: null, lastSeenAt: null, createdAt: new Date(), skills: [],
    });
    await service.update("user-id", { displayName: "", bio: "" });
    expect(prisma.user.update.mock.calls[0][0].data).toEqual({ displayName: null, bio: null });
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
