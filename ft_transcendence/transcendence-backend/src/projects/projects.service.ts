import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, groupId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: { ...dto, groupId, createdById: userId },
    });
  }

  findAll(groupId: string) {
    return this.prisma.project.findMany({
      where: { groupId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { _count: { select: { tasks: true } } },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  update(projectId: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id: projectId }, data: dto });
  }

  remove(projectId: string) {
    return this.prisma.project.delete({ where: { id: projectId } });
  }
}
