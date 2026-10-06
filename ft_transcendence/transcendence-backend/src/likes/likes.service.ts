import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService, private readonly posts: PostsService) {}

  async toggle(userId: string, postId: string) {
    await this.posts.assertReadable(postId, userId);
    return this.prisma.$transaction(async (tx) => {
      const where = { postId_userId: { postId, userId } };
      const existing = await tx.like.findUnique({ where, select: { userId: true } });
      if (existing) {
        await tx.like.delete({ where });
      } else {
        await tx.like.create({ data: { postId, userId } });
      }
      const likesCount = await tx.like.count({ where: { postId } });
      return { liked: !existing, likesCount };
    });
  }
}
