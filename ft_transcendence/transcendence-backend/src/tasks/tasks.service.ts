import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";

const taskInclude = {
  assignee: { select: { id: true, email: true, username: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    const project = await this.getProject(projectId);
    if (dto.assigneeId)
      await this.ensureCommunityMember(dto.assigneeId, project.communityId);
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        projectId,
        createdById: userId,
      },
      include: taskInclude,
    });
  }

  async findAll(projectId: string, query: TaskQueryDto) {
    const {
      page,
      limit,
      status,
      priority,
      assigneeId,
      search,
      sortBy,
      sortOrder,
    } = query;
    const where: Prisma.TaskWhereInput = {
      projectId,
      status,
      priority,
      assigneeId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { project: { select: { communityId: true } } },
    });
    if (!task) throw new NotFoundException("Task not found");
    if (dto.assigneeId)
      await this.ensureCommunityMember(
        dto.assigneeId,
        task.project.communityId,
      );
    const data: Prisma.TaskUpdateInput = {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      dueDate:
        dto.dueDate === null
          ? null
          : dto.dueDate
            ? new Date(dto.dueDate)
            : undefined,
      assignee:
        dto.assigneeId === null
          ? { disconnect: true }
          : dto.assigneeId
            ? { connect: { id: dto.assigneeId } }
            : undefined,
    };
    return this.prisma.task.update({
      where: { id: taskId },
      data,
      include: taskInclude,
    });
  }

  updateStatus(taskId: string, dto: UpdateTaskStatusDto) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
      include: taskInclude,
    });
  }

  remove(taskId: string) {
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  private async getProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { communityId: true },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  private async ensureCommunityMember(userId: string, communityId: string) {
    const communityMember = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
      select: { id: true },
    });
    if (!communityMember)
      throw new BadRequestException(
        "Assignee must be a member of the project community",
      );
  }
}
