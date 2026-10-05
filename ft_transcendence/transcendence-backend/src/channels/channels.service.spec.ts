import { NotFoundException } from "@nestjs/common";
import { ChannelType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ChannelsService } from "./channels.service";

describe("ChannelsService", () => {
  const prisma = {
    channel: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  let service: ChannelsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChannelsService(prisma as unknown as PrismaService);
  });

  it("creates a text channel in a community", async () => {
    prisma.channel.create.mockResolvedValue({
      id: "channel-id",
      name: "general",
      type: ChannelType.TEXT,
    });

    const result = await service.create("community-id", "user-id", {
      name: "general",
    });

    expect(result.name).toBe("general");
    expect(prisma.channel.create).toHaveBeenCalledWith({
      data: {
        name: "general",
        communityId: "community-id",
        createdById: "user-id",
      },
    });
  });

  it("lists channels for one community", async () => {
    prisma.channel.findMany.mockResolvedValue([]);
    await service.findAll("community-id");
    expect(prisma.channel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { communityId: "community-id" } }),
    );
  });

  it("returns not found for a missing channel", async () => {
    prisma.channel.findUnique.mockResolvedValue(null);
    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
