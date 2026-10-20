import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommunityRole } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { Permission } from "../permissions/permission.enum";
import { roleHasPermissions } from "../roles/role-permissions";
import { CreateInvitationDto } from "./dto/create-invitation.dto";

const INVITATION_SELECT = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  community: {
    select: { id: true, name: true, description: true, isPublic: true },
  },
  inviter: { select: { id: true, username: true } },
  invitee: { select: { id: true, username: true } },
} as const;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Route guard already checked MEMBER_ADD. Only owners may invite admins. */
  async create(
    inviterId: string,
    communityId: string,
    dto: CreateInvitationDto,
  ) {
    const inviterMembership = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: inviterId, communityId } },
      select: { role: true },
    });

    if (
      !inviterMembership ||
      !roleHasPermissions(inviterMembership.role, [Permission.MEMBER_ADD])
    ) {
      throw new ForbiddenException("You are not a member of this community");
    }
    if (
      dto.role === CommunityRole.ADMIN &&
      inviterMembership.role !== CommunityRole.OWNER
    ) {
      throw new ForbiddenException("Only owners can invite administrators");
    }

    const invitee = await this.prisma.user.findUnique({
      where: { username: dto.username },
      select: { id: true, username: true },
    });

    if (!invitee) {
      throw new NotFoundException("No member has this username");
    }

    const [membership, pending, block] = await Promise.all([
      this.prisma.communityMember.findUnique({
        where: { userId_communityId: { userId: invitee.id, communityId } },
        select: { id: true },
      }),
      this.prisma.communityInvitation.findFirst({
        where: { communityId, inviteeId: invitee.id, status: "PENDING" },
        select: { id: true },
      }),
      this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: inviterId, blockedId: invitee.id },
            { blockerId: invitee.id, blockedId: inviterId },
          ],
        },
        select: { blockerId: true },
      }),
    ]);

    if (membership) {
      throw new ConflictException(`${invitee.username} is already a member`);
    }
    if (pending) {
      throw new ConflictException(
        `${invitee.username} already has a pending invitation`,
      );
    }
    if (block) {
      throw new ForbiddenException("You cannot invite this user");
    }

    const invitation = await this.prisma.communityInvitation.create({
      data: {
        communityId,
        inviterId,
        inviteeId: invitee.id,
        role: dto.role ?? CommunityRole.MEMBER,
      },
      select: INVITATION_SELECT,
    });

    await this.notifications.create(invitee.id, {
      type: "COMMUNITY_INVITE",
      title: `You're invited to ${invitation.community.name}`,
      message: `${invitation.inviter.username} invited you to join.`,
      link: "/communities",
    });

    return invitation;
  }

  /** Pending invitations of one community (for members who can invite). */
  findForCommunity(communityId: string) {
    return this.prisma.communityInvitation.findMany({
      where: { communityId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: INVITATION_SELECT,
    });
  }

  /** Revoke a pending invitation. Route guard checked MEMBER_ADD. */
  async revoke(communityId: string, invitationId: string) {
    const result = await this.prisma.communityInvitation.deleteMany({
      where: { id: invitationId, communityId, status: "PENDING" },
    });

    if (!result.count) {
      throw new NotFoundException("Invitation not found");
    }
  }

  /** My pending invitations. */
  findMine(userId: string) {
    return this.prisma.communityInvitation.findMany({
      where: { inviteeId: userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: INVITATION_SELECT,
    });
  }

  private async requirePendingFor(userId: string, invitationId: string) {
    const invitation = await this.prisma.communityInvitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        inviteeId: true,
        inviterId: true,
        communityId: true,
        role: true,
        status: true,
      },
    });

    if (
      !invitation ||
      invitation.inviteeId !== userId ||
      invitation.status !== "PENDING"
    ) {
      throw new NotFoundException("Invitation not found");
    }
    return invitation;
  }

  /** Accept: the membership is created with the invited role. */
  async accept(userId: string, invitationId: string) {
    const invitation = await this.requirePendingFor(userId, invitationId);

    // Invitations may outlive a block, removal or demotion of the inviter.
    const [block, inviterMembership] = await Promise.all([
      this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: invitation.inviterId },
            { blockerId: invitation.inviterId, blockedId: userId },
          ],
        },
        select: { blockerId: true },
      }),
      this.prisma.communityMember.findUnique({
        where: {
          userId_communityId: {
            userId: invitation.inviterId,
            communityId: invitation.communityId,
          },
        },
        select: { role: true },
      }),
    ]);
    if (block) {
      throw new ForbiddenException("You cannot accept this invitation");
    }
    if (
      !inviterMembership ||
      !roleHasPermissions(inviterMembership.role, [Permission.MEMBER_ADD]) ||
      (invitation.role === CommunityRole.ADMIN &&
        inviterMembership.role !== CommunityRole.OWNER)
    ) {
      throw new ForbiddenException(
        "The inviter no longer has permission to grant this role",
      );
    }

    const [, membership] = await this.prisma.$transaction([
      this.prisma.communityInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      }),
      this.prisma.communityMember.upsert({
        where: {
          userId_communityId: { userId, communityId: invitation.communityId },
        },
        update: {},
        create: {
          userId,
          communityId: invitation.communityId,
          role: invitation.role,
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          community: { select: { id: true, name: true } },
          user: { select: { username: true } },
        },
      }),
    ]);

    await this.notifications.create(invitation.inviterId, {
      type: "INVITE_ACCEPTED",
      title: `${membership.user.username} joined ${membership.community.name}`,
      message: "Your invitation was accepted.",
      link: `/communities/${membership.community.id}/members`,
    });

    return membership;
  }

  async decline(userId: string, invitationId: string) {
    const invitation = await this.requirePendingFor(userId, invitationId);

    await this.prisma.communityInvitation.update({
      where: { id: invitation.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
  }
}
