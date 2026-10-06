import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ReportStatus,
  ReportTargetType,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReviewReportDto } from "./dto/review-report.dto";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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

      return this.prisma.report.create({
        data: {
          reporterId,
          communityId,
          targetType: ReportTargetType.POST,
          postId: post.id,
          reason,
        },
        include: this.includeRelations(),
      });
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

    return this.prisma.report.create({
      data: {
        reporterId,
        communityId,
        targetType: ReportTargetType.COMMENT,
        commentId: comment.id,
        reason,
      },
      include: this.includeRelations(),
    });
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
      },
    });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (report.status !== ReportStatus.OPEN) {
      throw new BadRequestException("Report has already been reviewed");
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: this.includeRelations(),
    });

    await this.notificationsService.create(
      report.reporterId,
      {
        type: "REPORT_REVIEWED",
        title: "Report reviewed",
        message: `Your report was ${dto.status.toLowerCase()}.`,
      },
    );

    return updatedReport;
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
