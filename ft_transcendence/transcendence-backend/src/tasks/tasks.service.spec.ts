import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TaskStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  const prisma = {
    project: { findUnique: jest.fn() },
    member: { findUnique: jest.fn() },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  let service: TasksService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TasksService(prisma as unknown as PrismaService);
    prisma.project.findUnique.mockResolvedValue({ groupId: "group-id" });
  });

  it("paginates tasks and returns metadata", async () => {
    const tasks = [{ id: "task-id" }];
    prisma.task.findMany.mockReturnValue("find-query");
    prisma.task.count.mockReturnValue("count-query");
    prisma.$transaction.mockResolvedValue([tasks, 21]);

    const result = await service.findAll("project-id", {
      page: 2,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
    expect(result).toEqual({
      data: tasks,
      meta: { page: 2, limit: 10, total: 21, totalPages: 3 },
    });
  });

  it("builds status, priority, assignee, and text filters", async () => {
    prisma.task.findMany.mockReturnValue("find-query");
    prisma.task.count.mockReturnValue("count-query");
    prisma.$transaction.mockResolvedValue([[], 0]);

    await service.findAll("project-id", {
      page: 1,
      limit: 20,
      status: TaskStatus.DONE,
      priority: "HIGH" as never,
      assigneeId: "assignee-id",
      search: "authentication",
      sortBy: "title",
      sortOrder: "asc",
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: "project-id",
          status: TaskStatus.DONE,
          assigneeId: "assignee-id",
          OR: expect.any(Array),
        }),
        orderBy: { title: "asc" },
      }),
    );
  });

  it("creates a task in a project", async () => {
    prisma.task.create.mockResolvedValue({ id: "task-id" });
    await service.create("user-id", "project-id", { title: "Build API" });
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "project-id",
          createdById: "user-id",
        }),
      }),
    );
  });

  it("accepts an assignee who belongs to the project group", async () => {
    prisma.member.findUnique.mockResolvedValue({ id: "membership-id" });
    prisma.task.create.mockResolvedValue({ id: "task-id" });
    await service.create("user-id", "project-id", {
      title: "Build API",
      assigneeId: "assignee-id",
    });
    expect(prisma.member.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_groupId: { userId: "assignee-id", groupId: "group-id" },
        },
      }),
    );
  });

  it("rejects an assignee outside the project group", async () => {
    prisma.member.findUnique.mockResolvedValue(null);
    await expect(
      service.create("user-id", "project-id", {
        title: "Build API",
        assigneeId: "outsider-id",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns not found when creating under a missing project", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    await expect(
      service.create("user-id", "missing-id", { title: "Build API" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates task status separately from other fields", async () => {
    prisma.task.update.mockResolvedValue({
      id: "task-id",
      status: TaskStatus.DONE,
    });
    await service.updateStatus("task-id", { status: TaskStatus.DONE });
    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-id" },
        data: { status: TaskStatus.DONE },
      }),
    );
  });
});
