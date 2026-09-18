import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GroupRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { Permission } from "../permission.enum";
import { GroupPermissionGuard } from "./group-permission.guard";

describe("GroupPermissionGuard", () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const prisma = {
    group: { findUnique: jest.fn() },
    member: { findUnique: jest.fn() },
  };
  let guard: GroupPermissionGuard;

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: "user-id" },
        params: { groupId: "group-id" },
      }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new GroupPermissionGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
    reflector.getAllAndOverride.mockReturnValue([Permission.MEMBER_ADD]);
    prisma.group.findUnique.mockResolvedValue({ id: "group-id" });
  });

  it("allows a role containing the required permission", async () => {
    prisma.member.findUnique.mockResolvedValue({ role: GroupRole.OWNER });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it("rejects a role without the required permission", async () => {
    prisma.member.findUnique.mockResolvedValue({ role: GroupRole.MEMBER });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects a user who is not a group member", async () => {
    prisma.member.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
