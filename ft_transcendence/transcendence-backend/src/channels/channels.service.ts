import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(communityId: string) {
    return this.prisma.channel.findMany({
      where: { communityId },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    });
  }

  async create(
    communityId: string,
    createdById: string,
    dto: CreateChannelDto,
  ) {
    try {
      return await this.prisma.channel.create({
        data: { ...dto, communityId, createdById },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A channel with this name already exists");
      }
      throw error;
    }
  }

  async findOne(channelId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException("Channel not found");
    return channel;
  }

  async update(channelId: string, dto: UpdateChannelDto) {
    await this.findOne(channelId);
    try {
      return await this.prisma.channel.update({
        where: { id: channelId },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("A channel with this name already exists");
      }
      throw error;
    }
  }

  async remove(channelId: string) {
    await this.findOne(channelId);
    await this.prisma.channel.delete({ where: { id: channelId } });
  }
}
