import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CommunityRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { Permission } from "../permission.enum";
import { CommunityPermissionGuard } from "./community-permission.guard";

describe("CommunityPermissionGuard", () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const prisma = {
    community: { findUnique: jest.fn() },
    communityMember: { findUnique: jest.fn() },
  };
  let guard: CommunityPermissionGuard;

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "user-id" },
        params: { communityId: "community-id" },
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new CommunityPermissionGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
    reflector.getAllAndOverride.mockReturnValue([Permission.MEMBER_ADD]);
    prisma.community.findUnique.mockResolvedValue({ id: "community-id" });
  });

  it("allows a role containing the required permission", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      role: CommunityRole.OWNER,
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it("rejects a role without the required permission", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      role: CommunityRole.MEMBER,
    });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects a user who is not a community communityMember", async () => {
    prisma.communityMember.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
