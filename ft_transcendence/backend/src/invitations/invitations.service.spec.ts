// The real service pulls in the socket gateway, which unit tests do not need.
jest.mock("../notifications/notifications.service", () => ({
  NotificationsService: class NotificationsService {},
}));

import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import type { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { InvitationsService } from "./invitations.service";

describe("InvitationsService", () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    block: { findFirst: jest.fn() },
    communityMember: { findUnique: jest.fn(), upsert: jest.fn() },
    communityInvitation: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((items: unknown[]) => Promise.all(items)),
  };
  const notifications = { create: jest.fn() };
  let service: InvitationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InvitationsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
    prisma.user.findUnique.mockResolvedValue({
      id: "invitee",
      username: "heba",
    });
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.communityInvitation.findFirst.mockResolvedValue(null);
  });

  it("only owners can invite administrators", async () => {
    prisma.communityMember.findUnique.mockResolvedValueOnce({
      role: "MODERATOR",
    });
    await expect(
      service.create("me", "c1", { username: "heba", role: "ADMIN" }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("does not invite someone who is already a member", async () => {
    prisma.communityMember.findUnique
      .mockResolvedValueOnce({ role: "OWNER" })
      .mockResolvedValueOnce({ id: "m1" });
    await expect(
      service.create("me", "c1", { username: "heba" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("creates the invitation and notifies the invitee", async () => {
    prisma.communityMember.findUnique
      .mockResolvedValueOnce({ role: "OWNER" })
      .mockResolvedValueOnce(null);
    prisma.communityInvitation.create.mockResolvedValue({
      id: "i1",
      community: { name: "Web Builders" },
      inviter: { username: "afnan" },
    });
    await service.create("me", "c1", { username: "heba" });
    expect(notifications.create).toHaveBeenCalledWith(
      "invitee",
      expect.objectContaining({
        type: "COMMUNITY_INVITE",
        link: "/communities",
      }),
    );
  });

  it("accepting creates the membership with the invited role", async () => {
    prisma.communityInvitation.findUnique.mockResolvedValue({
      id: "i1",
      inviteeId: "invitee",
      inviterId: "me",
      communityId: "c1",
      role: "MODERATOR",
      status: "PENDING",
    });
    prisma.communityInvitation.update.mockResolvedValue({});
    prisma.communityMember.upsert.mockResolvedValue({
      id: "m1",
      role: "MODERATOR",
      community: { id: "c1", name: "Web Builders" },
      user: { username: "heba" },
    });
    prisma.communityMember.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    await service.accept("invitee", "i1");
    expect(prisma.communityMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { userId: "invitee", communityId: "c1", role: "MODERATOR" },
      }),
    );
  });

  it("someone else cannot accept your invitation", async () => {
    prisma.communityInvitation.findUnique.mockResolvedValue({
      id: "i1",
      inviteeId: "invitee",
      status: "PENDING",
    });
    await expect(service.accept("stranger", "i1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it("rejects acceptance after either person blocks the other", async () => {
    prisma.communityInvitation.findUnique.mockResolvedValue({
      id: "i1",
      inviteeId: "invitee",
      inviterId: "me",
      communityId: "c1",
      role: "MEMBER",
      status: "PENDING",
    });
    prisma.block.findFirst.mockResolvedValue({ blockerId: "invitee" });
    prisma.communityMember.findUnique.mockResolvedValue({ role: "OWNER" });
    await expect(service.accept("invitee", "i1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it.each([null, { role: "MEMBER" }, { role: "MODERATOR" }])(
    "rejects acceptance when the inviter can no longer invite: %p",
    async (membership) => {
      prisma.communityInvitation.findUnique.mockResolvedValue({
        id: "i1",
        inviteeId: "invitee",
        inviterId: "me",
        communityId: "c1",
        role: "MEMBER",
        status: "PENDING",
      });
      prisma.communityMember.findUnique.mockResolvedValue(membership);
      await expect(service.accept("invitee", "i1")).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it("rejects an administrator invitation after the owner is demoted to admin", async () => {
    prisma.communityInvitation.findUnique.mockResolvedValue({
      id: "i1",
      inviteeId: "invitee",
      inviterId: "me",
      communityId: "c1",
      role: "ADMIN",
      status: "PENDING",
    });
    prisma.communityMember.findUnique.mockResolvedValue({ role: "ADMIN" });
    await expect(service.accept("invitee", "i1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
