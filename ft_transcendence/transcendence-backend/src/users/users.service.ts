import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findSafeById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email || dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.username ? [{ username: dto.username }] : []),
          ],
        },
        select: { email: true, username: true },
      });

      if (existing?.email === dto.email)
        throw new ConflictException("Email is already in use");
      if (existing?.username === dto.username)
        throw new ConflictException("Username is already in use");
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email or username is already in use");
      }
      throw error;
    }
  }
}
