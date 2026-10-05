import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommunityRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CommunityMembersService } from "./community-members.service";

describe("CommunityMembersService", () => {
  const prisma = {
    community: { findUnique: jest.fn() },
    communityMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
  };
  let service: CommunityMembersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommunityMembersService(prisma as unknown as PrismaService);
    prisma.community.findUnique.mockResolvedValue({ id: "community-id" });
  });

  it("allows an owner to add a registered user", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      id: "owner-communityMembership",
      role: CommunityRole.OWNER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: "new-user-id",
      email: "communityMember@example.com",
      username: "communityMember",
    });
    prisma.communityMember.create.mockResolvedValue({
      id: "new-communityMembership",
      role: CommunityRole.MEMBER,
      user: {
        id: "new-user-id",
        email: "communityMember@example.com",
        username: "communityMember",
      },
    });

    const result = await service.add("owner-id", "community-id", {
      email: "communityMember@example.com",
    });

    expect(result.role).toBe(CommunityRole.MEMBER);
    expect(prisma.communityMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "new-user-id" }),
      }),
    );
  });

  it("prevents an admin from assigning another admin", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      id: "communityMembership-id",
      role: CommunityRole.ADMIN,
    });

    await expect(
      service.add("admin-id", "community-id", {
        email: "new@example.com",
        role: CommunityRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects an email that does not belong to a registered user", async () => {
    prisma.communityMember.findUnique.mockResolvedValue({
      id: "owner-communityMembership",
      role: CommunityRole.OWNER,
    });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.add("owner-id", "community-id", { email: "missing@example.com" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents outsiders from listing community communityMembers", async () => {
    prisma.communityMember.findUnique.mockResolvedValue(null);

    await expect(
      service.findAll("outsider-id", "community-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("changes a non-owner communityMember role", async () => {
    prisma.communityMember.findUnique
      .mockResolvedValueOnce({ id: "owner-id", role: CommunityRole.OWNER })
      .mockResolvedValueOnce({
        id: "communityMember-id",
        communityId: "community-id",
        role: CommunityRole.MEMBER,
      });
    prisma.communityMember.update.mockResolvedValue({
      id: "communityMember-id",
      role: CommunityRole.ADMIN,
    });

    const result = await service.changeRole(
      "owner-user-id",
      "community-id",
      "communityMember-id",
      { role: CommunityRole.ADMIN },
    );

    expect(result.role).toBe(CommunityRole.ADMIN);
  });

  it("protects the owner from role changes and removal", async () => {
    prisma.communityMember.findUnique
      .mockResolvedValueOnce({ id: "owner-id", role: CommunityRole.OWNER })
      .mockResolvedValueOnce({
        id: "owner-id",
        communityId: "community-id",
        role: CommunityRole.OWNER,
      })
      .mockResolvedValueOnce({ id: "owner-id", role: CommunityRole.OWNER })
      .mockResolvedValueOnce({
        id: "owner-id",
        communityId: "community-id",
        role: CommunityRole.OWNER,
      });

    await expect(
      service.changeRole("owner-user-id", "community-id", "owner-id", {
        role: CommunityRole.MEMBER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.remove("owner-user-id", "community-id", "owner-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
