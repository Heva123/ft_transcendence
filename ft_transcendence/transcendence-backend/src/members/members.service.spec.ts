import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { GroupRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MembersService } from "./members.service";

describe("MembersService", () => {
  const prisma = {
    group: { findUnique: jest.fn() },
    member: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
  };
  let service: MembersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MembersService(prisma as unknown as PrismaService);
    prisma.group.findUnique.mockResolvedValue({ id: "group-id" });
  });

  it("allows an owner to add a registered user", async () => {
    prisma.member.findUnique.mockResolvedValue({
      id: "owner-membership",
      role: GroupRole.OWNER,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: "new-user-id",
      email: "member@example.com",
      username: "member",
    });
    prisma.member.create.mockResolvedValue({
      id: "new-membership",
      role: GroupRole.MEMBER,
      user: {
        id: "new-user-id",
        email: "member@example.com",
        username: "member",
      },
    });

    const result = await service.add("owner-id", "group-id", {
      email: "member@example.com",
    });

    expect(result.role).toBe(GroupRole.MEMBER);
    expect(prisma.member.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "new-user-id" }),
      }),
    );
  });

  it("prevents an admin from assigning another admin", async () => {
    prisma.member.findUnique.mockResolvedValue({
      id: "membership-id",
      role: GroupRole.ADMIN,
    });

    await expect(
      service.add("admin-id", "group-id", {
        email: "new@example.com",
        role: GroupRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects an email that does not belong to a registered user", async () => {
    prisma.member.findUnique.mockResolvedValue({
      id: "owner-membership",
      role: GroupRole.OWNER,
    });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.add("owner-id", "group-id", { email: "missing@example.com" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents outsiders from listing group members", async () => {
    prisma.member.findUnique.mockResolvedValue(null);

    await expect(
      service.findAll("outsider-id", "group-id"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("changes a non-owner member role", async () => {
    prisma.member.findUnique.mockResolvedValue({
      id: "member-id",
      groupId: "group-id",
      role: GroupRole.MEMBER,
    });
    prisma.member.update.mockResolvedValue({
      id: "member-id",
      role: GroupRole.ADMIN,
    });

    const result = await service.changeRole("group-id", "member-id", {
      role: GroupRole.ADMIN,
    });

    expect(result.role).toBe(GroupRole.ADMIN);
  });

  it("protects the owner from role changes and removal", async () => {
    prisma.member.findUnique.mockResolvedValue({
      id: "owner-id",
      groupId: "group-id",
      role: GroupRole.OWNER,
    });

    await expect(
      service.changeRole("group-id", "owner-id", { role: GroupRole.MEMBER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove("group-id", "owner-id")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
