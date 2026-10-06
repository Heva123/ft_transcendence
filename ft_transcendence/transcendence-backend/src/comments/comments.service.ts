import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { toReplyResponse } from '../posts/post-response';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService, private readonly posts: PostsService) {}

  async list(userId: string, postId: string) {
    await this.posts.assertReadable(postId, userId);
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { id: true, username: true } } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 100,
    });
    return comments.map(toReplyResponse);
  }

  async create(userId: string, postId: string, dto: CreateCommentDto) {
    await this.posts.assertReadable(postId, userId);
    const parentId = dto.parentId ?? null;
    if (parentId !== null) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });
      if (!parent || parent.postId !== postId) {
        throw new BadRequestException('parentId must refer to a comment on this post');
      }
    }
    const comment = await this.prisma.comment.create({
      data: { authorId: userId, postId, content: this.validContent(dto.content), parentId },
      include: { author: { select: { id: true, username: true } } },
    });
    return toReplyResponse(comment);
  }

  async update(userId: string, postId: string, commentId: string, dto: UpdateCommentDto) {
    await this.posts.assertReadable(postId, userId);
    await this.assertOwned(userId, postId, commentId);
    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: this.validContent(dto.content) },
      include: { author: { select: { id: true, username: true } } },
    });
    return toReplyResponse(comment);
  }

  async remove(userId: string, postId: string, commentId: string) {
    await this.posts.assertReadable(postId, userId);
    await this.assertOwned(userId, postId, commentId);
    await this.prisma.comment.delete({ where: { id: commentId } });
    return { deleted: true, id: commentId };
  }

  private async assertOwned(userId: string, postId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.postId !== postId) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Only the author may edit this comment');
  }

  private validContent(content: string): string {
    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 1000) {
      throw new BadRequestException('Comment content must contain 1–1000 characters');
    }
    return trimmed;
  }
}
