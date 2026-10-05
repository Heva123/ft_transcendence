import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  const prisma = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  let service: ProjectsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectsService(prisma as unknown as PrismaService);
  });

  it("connects a new project to its community and creator", async () => {
    prisma.project.create.mockResolvedValue({ id: "project-id" });
    await service.create("user-id", "community-id", { name: "API" });
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: "API",
        communityId: "community-id",
        createdById: "user-id",
      },
    });
  });

  it("lists only projects from the selected community", async () => {
    prisma.project.findMany.mockResolvedValue([]);
    await service.findAll("community-id");
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { communityId: "community-id" } }),
    );
  });

  it("returns not found for a missing project", async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
