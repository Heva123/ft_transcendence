// The real services pull in the socket gateway, which unit tests do not need.
jest.mock("../notifications/notifications.service", () => ({
  NotificationsService: class NotificationsService {},
}));
jest.mock("../messages/messages.service", () => ({
  MessagesService: class MessagesService {},
}));

import { BadRequestException } from "@nestjs/common";
import { ReportStatus, ReportTargetType } from "@prisma/client";
import type { MessagesService } from "../messages/messages.service";
import type { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { ReportsService } from "./reports.service";

describe("ReportsService.review", () => {
  const prisma = {
    report: { findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    post: { findUnique: jest.fn(), delete: jest.fn() },
    comment: { findUnique: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  const notifications = { create: jest.fn() };
  const messages = { getBlockedUserIds: jest.fn() };
  let service: ReportsService;

  const openReport = (target: ReportTargetType) => ({
    id: "r1",
    status: ReportStatus.OPEN,
    reporterId: "heba",
    targetType: target,
    postId: target === ReportTargetType.POST ? "p1" : null,
    commentId: target === ReportTargetType.COMMENT ? "c1" : null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
      messages as unknown as MessagesService,
    );
    prisma.report.update.mockResolvedValue({ id: "r1" });
    prisma.post.findUnique.mockResolvedValue({ authorId: "worod" });
    prisma.comment.findUnique.mockResolvedValue({ authorId: "worod" });
  });

  it("resolves a report and removes the reported post", async () => {
    prisma.report.findFirst.mockResolvedValue(openReport(ReportTargetType.POST));

    await service.review("afnan", "g1", "r1", { status: ReportStatus.RESOLVED, removeContent: true });

    expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(prisma.report.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ postId: "p1", status: ReportStatus.OPEN }) }),
    );
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: ReportStatus.RESOLVED, reviewedById: "afnan" }) }),
    );
    const notified = notifications.create.mock.calls.map(([userId, n]) => `${userId}:${n.type}`);
    expect(notified).toEqual(["heba:REPORT_REVIEWED", "worod:REPORT_CONTENT_REMOVED"]);
  });

  it("removes a reported reply", async () => {
    prisma.report.findFirst.mockResolvedValue(openReport(ReportTargetType.COMMENT));

    await service.review("afnan", "g1", "r1", { status: ReportStatus.RESOLVED, removeContent: true });

    expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
    expect(prisma.post.delete).not.toHaveBeenCalled();
  });

  it("dismisses a report without touching the content", async () => {
    prisma.report.findFirst.mockResolvedValue(openReport(ReportTargetType.POST));

    await service.review("afnan", "g1", "r1", { status: ReportStatus.DISMISSED });

    expect(prisma.post.delete).not.toHaveBeenCalled();
    expect(notifications.create).toHaveBeenCalledTimes(1);
  });

  it("refuses to remove content when the report is dismissed", async () => {
    prisma.report.findFirst.mockResolvedValue(openReport(ReportTargetType.POST));

    await expect(
      service.review("afnan", "g1", "r1", { status: ReportStatus.DISMISSED, removeContent: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.post.delete).not.toHaveBeenCalled();
  });

  it("refuses a report that was already reviewed", async () => {
    prisma.report.findFirst.mockResolvedValue({ ...openReport(ReportTargetType.POST), status: ReportStatus.RESOLVED });

    await expect(
      service.review("afnan", "g1", "r1", { status: ReportStatus.RESOLVED }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
