import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';
import { toReplyResponse } from '../posts/post-response';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: PostsService,
    private readonly messages: MessagesService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(userId: string, postId: string) {
    await this.posts.assertReadable(postId, userId);
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarPath: true,
          },
        },
      },
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
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarPath: true,
          },
        },
      },
    });
    await this.notifyCommentCreated(
      userId,
      postId,
      parentId,
    );

    return toReplyResponse(comment);
  }

  private async notifyCommentCreated(
    actorId: string,
    postId: string,
    parentId: string | null,
  ) {
    const [actor, post, parent, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      }),
      parentId
        ? this.prisma.comment.findUnique({
            where: { id: parentId },
            select: {
              authorId: true,
              postId: true,
            },
          })
        : Promise.resolve(null),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (!actor || !post) return;

    const recipientIds = new Set<string>();

    if (
      post.authorId !== actorId &&
      !blockedUserIds.includes(post.authorId)
    ) {
      recipientIds.add(post.authorId);
    }

    if (
      parent &&
      parent.postId === postId &&
      parent.authorId !== actorId &&
      !blockedUserIds.includes(parent.authorId)
    ) {
      recipientIds.add(parent.authorId);
    }

    await Promise.all(
      [...recipientIds].map((userId) =>
        this.notifications.create(userId, {
          type: "COMMENT_CREATED",
          title: "New comment",
          message: `${actor.username} commented on a post.`,
          link: `/posts/${postId}`,
        }),
      ),
    );
  }

  async update(userId: string, postId: string, commentId: string, dto: UpdateCommentDto) {
    await this.posts.assertReadable(postId, userId);
    await this.assertOwned(userId, postId, commentId);
    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: this.validContent(dto.content) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarPath: true,
          },
        },
      },
    });

    await this.notifyCommentUpdated(userId, postId);

    return toReplyResponse(comment);
  }

  private async notifyCommentUpdated(
    actorId: string,
    postId: string,
  ) {
    const [actor, post, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      }),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (
      !actor ||
      !post ||
      post.authorId === actorId ||
      blockedUserIds.includes(post.authorId)
    ) {
      return;
    }

    await this.notifications.create(post.authorId, {
      type: "COMMENT_UPDATED",
      title: "Comment updated",
      message: `${actor.username} updated a comment on your post.`,
      link: `/posts/${postId}`,
    });
  }

  async remove(userId: string, postId: string, commentId: string) {
    await this.posts.assertReadable(postId, userId);
    await this.assertOwned(userId, postId, commentId);
    await this.prisma.comment.delete({ where: { id: commentId } });

    await this.notifications.create(userId, {
      type: "COMMENT_DELETED",
      title: "Comment deleted",
      message: "Your comment was deleted.",
      link: `/posts/${postId}`,
    });

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
