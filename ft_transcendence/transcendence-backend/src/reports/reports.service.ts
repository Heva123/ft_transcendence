import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CommunityRole,
  ReportStatus,
  ReportTargetType,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { MessagesService } from "../messages/messages.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReviewReportDto } from "./dto/review-report.dto";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly messages: MessagesService,
  ) {}

  async create(
    reporterId: string,
    communityId: string,
    dto: CreateReportDto,
  ) {
    const reason = dto.reason.trim();

    if (!reason) {
      throw new BadRequestException("Report reason is required");
    }

    if (dto.targetType === ReportTargetType.POST) {
      const post = await this.prisma.post.findUnique({
        where: { id: dto.targetId },
        select: {
          id: true,
          communityId: true,
        },
      });

      if (!post || post.communityId !== communityId) {
        throw new NotFoundException("Post not found in this community");
      }

      const createdReport = await this.prisma.report.create({
        data: {
          reporterId,
          communityId,
          targetType: ReportTargetType.POST,
          postId: post.id,
          reason,
        },
        include: this.includeRelations(),
      });

      await this.notifyReportCreated(reporterId, communityId);

      return createdReport;
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: dto.targetId },
      select: {
        id: true,
        post: {
          select: {
            communityId: true,
          },
        },
      },
    });

    if (!comment || comment.post.communityId !== communityId) {
      throw new NotFoundException("Comment not found in this community");
    }

    const createdReport = await this.prisma.report.create({
      data: {
        reporterId,
        communityId,
        targetType: ReportTargetType.COMMENT,
        commentId: comment.id,
        reason,
      },
      include: this.includeRelations(),
    });

    await this.notifyReportCreated(reporterId, communityId);

    return createdReport;
  }

  private async notifyReportCreated(
    reporterId: string,
    communityId: string,
  ) {
    const [reporter, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: reporterId },
        select: { username: true },
      }),
      this.messages.getBlockedUserIds(reporterId),
    ]);

    if (!reporter) return;

    const moderators = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        role: {
          in: [
            CommunityRole.OWNER,
            CommunityRole.ADMIN,
            CommunityRole.MODERATOR,
          ],
        },
        userId: {
          notIn: [reporterId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      moderators.map((member) =>
        this.notificationsService.create(member.userId, {
          type: "REPORT_CREATED",
          title: "New report",
          message: `${reporter.username} submitted a new report.`,
          link: `/communities/${communityId}/reports`,
        }),
      ),
    );
  }

  findAll(communityId: string) {
    return this.prisma.report.findMany({
      where: { communityId },
      include: this.includeRelations(),
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  async review(
    reviewerId: string,
    communityId: string,
    reportId: string,
    dto: ReviewReportDto,
  ) {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        communityId,
      },
      select: {
        id: true,
        status: true,
        reporterId: true,
        targetType: true,
        postId: true,
        commentId: true,
      },
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (report.status !== ReportStatus.OPEN) {
      throw new BadRequestException("Report has already been reviewed");
    }

    if (dto.removeContent && dto.status !== ReportStatus.RESOLVED) {
      throw new BadRequestException(
        "Content can only be removed when the report is resolved",
      );
    }

    const reviewed = {
      status: dto.status,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    };

    let removedAuthorId: string | null = null;

    if (dto.removeContent) {
      removedAuthorId = await this.removeReportedContent(
        communityId,
        report,
        reviewed,
      );
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: reviewed,
      include: this.includeRelations(),
    });

    await this.notificationsService.create(
      report.reporterId,
      {
        type: "REPORT_REVIEWED",
        title: "Report reviewed",
        message: `Your report was ${dto.status.toLowerCase()}.`,
        link: `/communities/${communityId}`,
      },
    );

    if (removedAuthorId && removedAuthorId !== reviewerId) {
      const what =
        report.targetType === ReportTargetType.POST ? "post" : "reply";
      await this.notificationsService.create(removedAuthorId, {
        type: "REPORT_CONTENT_REMOVED",
        title: "Content removed",
        message: `A moderator removed your ${what} after a report.`,
        link: `/communities/${communityId}`,
      });
    }

    return updatedReport;
  }

  // Deletes the reported post or reply and closes the other open reports
  // about it. Returns the author of the removed content, or null.
  private async removeReportedContent(
    communityId: string,
    report: {
      id: string;
      targetType: ReportTargetType;
      postId: string | null;
      commentId: string | null;
    },
    reviewed: {
      status: ReportStatus;
      reviewedById: string;
      reviewedAt: Date;
    },
  ): Promise<string | null> {
    if (report.targetType === ReportTargetType.POST && report.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: report.postId },
        select: { authorId: true },
      });
      if (!post) return null;

      await this.prisma.$transaction([
        this.prisma.report.updateMany({
          where: {
            communityId,
            postId: report.postId,
            status: ReportStatus.OPEN,
            id: { not: report.id },
          },
          data: reviewed,
        }),
        this.prisma.post.delete({ where: { id: report.postId } }),
      ]);
      return post.authorId;
    }

    if (report.targetType === ReportTargetType.COMMENT && report.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: report.commentId },
        select: { authorId: true },
      });
      if (!comment) return null;

      await this.prisma.$transaction([
        this.prisma.report.updateMany({
          where: {
            communityId,
            commentId: report.commentId,
            status: ReportStatus.OPEN,
            id: { not: report.id },
          },
          data: reviewed,
        }),
        this.prisma.comment.delete({ where: { id: report.commentId } }),
      ]);
      return comment.authorId;
    }

    return null;
  }

  private includeRelations() {
    return {
      reporter: {
        select: {
          id: true,
          username: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          username: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      comment: {
        select: {
          id: true,
          postId: true,
          content: true,
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    };
  }
}
