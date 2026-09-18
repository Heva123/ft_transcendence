import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

jest.mock("@nestjs/jwt", () => ({ JwtService: class JwtService {} }));

describe("AuthService", () => {
  const prisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue("test-token"),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  it("registers a user without returning passwordHash", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "user-id",
      email: "heba@example.com",
      username: "heba",
      createdAt: new Date("2026-09-12T00:00:00Z"),
      updatedAt: new Date("2026-09-12T00:00:00Z"),
    });

    const result = await service.register({
      email: "heba@example.com",
      username: "heba",
      password: "StrongPass123",
    });

    expect(result.accessToken).toBe("test-token");
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "heba@example.com",
          passwordHash: expect.not.stringMatching(/^StrongPass123$/),
        }),
      }),
    );
  });

  it("rejects a duplicate email or username", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "existing-id" });

    await expect(
      service.register({
        email: "heba@example.com",
        username: "heba",
        password: "StrongPass123",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with valid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-id",
      email: "heba@example.com",
      username: "heba",
      passwordHash: await hash("StrongPass123", 4),
      createdAt: new Date("2026-09-12T00:00:00Z"),
      updatedAt: new Date("2026-09-12T00:00:00Z"),
    });

    const result = await service.login({
      email: "heba@example.com",
      password: "StrongPass123",
    });

    expect(result.accessToken).toBe("test-token");
    expect(result.user).not.toHaveProperty("passwordHash");
  });

  it("rejects invalid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: "missing@example.com",
        password: "WrongPassword1",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
