import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posts: PostsService,
    private readonly messages: MessagesService,
    private readonly notifications: NotificationsService,
  ) {}

  private async notifyPostLiked(
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
      type: "POST_LIKED",
      title: "Post liked",
      message: `${actor.username} liked your post.`,
      link: `/posts/${postId}`,
    });
  }

  async toggle(userId: string, postId: string) {
    await this.posts.assertReadable(postId, userId);
    const result = await this.prisma.$transaction(async (tx) => {
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

    if (result.liked) {
      await this.notifyPostLiked(userId, postId);
    }

    return result;
  }
}
