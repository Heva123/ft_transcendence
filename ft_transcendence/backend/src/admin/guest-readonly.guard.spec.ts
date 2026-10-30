jest.mock("@nestjs/jwt", () => ({ JwtService: class JwtService {} }));

import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { GuestReadonlyGuard } from "./guest-readonly.guard";
import { SiteAdminGuard } from "./site-admin.guard";
import { PrismaService } from "../prisma/prisma.service";

const context = (
  method: string,
  siteRole = "USER",
  authorization: string | undefined = "Bearer valid",
) =>
  ({
    getType: () => "http",
    getHandler: () => {},
    getClass: () => {},
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        headers: { authorization },
        user: { siteRole },
      }),
    }),
  }) as unknown as ExecutionContext;

describe("Site access guards", () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const jwt = { verifyAsync: jest.fn() };
  const prisma = { user: { findUnique: jest.fn() } };
  const guard = new GuestReadonlyGuard(
    reflector as unknown as Reflector,
    jwt as unknown as JwtService,
    prisma as unknown as PrismaService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    jwt.verifyAsync.mockResolvedValue({ sub: "account" });
    prisma.user.findUnique.mockResolvedValue({ siteRole: "USER" });
  });
  it.each(["GET", "HEAD", "OPTIONS"])(
    "permits %s without writes",
    async (method) => {
      expect(await guard.canActivate(context(method, "GUEST"))).toBe(true);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    },
  );
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "rejects guest %s using current database role",
    async (method) => {
      prisma.user.findUnique.mockResolvedValue({ siteRole: "GUEST" });
      await expect(guard.canActivate(context(method))).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    },
  );
  it("allows public auth even with an old token", async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(await guard.canActivate(context("POST"))).toBe(true);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });
  it("rejects invalid tokens and deleted accounts", async () => {
    jwt.verifyAsync.mockRejectedValue(new Error("expired"));
    await expect(guard.canActivate(context("POST"))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    jwt.verifyAsync.mockResolvedValue({ sub: "deleted" });
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(guard.canActivate(context("POST"))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it.each(["USER", "GUEST"])("rejects %s on admin routes", (role) => {
    expect(() =>
      new SiteAdminGuard().canActivate(context("GET", role)),
    ).toThrow(ForbiddenException);
  });
  it("permits a site administrator", () => {
    expect(new SiteAdminGuard().canActivate(context("GET", "ADMIN"))).toBe(
      true,
    );
  });
});
