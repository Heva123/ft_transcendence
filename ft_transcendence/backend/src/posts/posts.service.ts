import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { toPostResponse, toReplyResponse } from './post-response';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messages: MessagesService,
    private readonly notifications: NotificationsService,
  ) {}

  async ensureCommunityAccess(userId: string, communityId: string | null): Promise<void> {
    if (communityId === null) return;
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });
    if (!community) throw new NotFoundException('Community not found');
    const member = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
      select: { userId: true },
    });
    if (!member) throw new ForbiddenException('Community membership required');
  }

  async assertReadable(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    await this.ensureCommunityAccess(userId, post.communityId);
    return post;
  }

  async list(userId: string, query: FeedQueryDto) {
    const page = query.page ?? 1;
    const communityId = query.communityId ?? null;
    await this.ensureCommunityAccess(userId, communityId);
    const posts = await this.prisma.post.findMany({
      where: { communityId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarPath: true,
          },
        },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * 10,
      take: 10,
    });
    return { posts: posts.map(toPostResponse) };
  }

  private async getResponse(userId: string, postId: string) {
    await this.assertReadable(postId, userId);
    const post = await this.prisma.post.findUniqueOrThrow({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarPath: true,
          },
        },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true } },
        likes: { where: { userId }, select: { userId: true } },
      },
    });
    return toPostResponse(post);
  }

  async one(userId: string, postId: string) {
    const post = await this.getResponse(userId, postId);
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
    return { post, comments: comments.map(toReplyResponse) };
  }

  async create(userId: string, dto: CreatePostDto) {
    const content = this.validContent(dto.content);
    const communityId = dto.communityId ?? null;
    await this.ensureCommunityAccess(userId, communityId);
    const created = await this.prisma.post.create({
      data: { authorId: userId, communityId, content },
      select: { id: true },
    });

    if (communityId) {
      await this.notifyPostCreated(userId, communityId, created.id);
    }

    return this.getResponse(userId, created.id);
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.assertReadable(postId, userId);
    if (post.authorId !== userId) throw new ForbiddenException('Only the author may edit a post');
    await this.prisma.post.update({
      where: { id: postId },
      data: { content: this.validContent(dto.content) },
    });

    await this.notifyPostUpdated(userId, postId);

    return this.getResponse(userId, postId);
  }

  async remove(userId: string, postId: string) {
    const post = await this.assertReadable(postId, userId);
    if (post.authorId !== userId) throw new ForbiddenException('Only the author may delete a post');
    await this.prisma.post.delete({ where: { id: postId } });

    await this.notifications.create(userId, {
      type: "POST_DELETED",
      title: "Post deleted",
      message: "Your post was deleted.",
      link: "/",
    });

    return { deleted: true, id: postId };
  }

  private async notifyPostUpdated(
    actorId: string,
    postId: string,
  ) {
    const [actor, blockedUserIds, replies] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.messages.getBlockedUserIds(actorId),
      this.prisma.comment.findMany({
        where: { postId },
        select: { authorId: true },
        distinct: ["authorId"],
      }),
    ]);

    if (!actor) return;

    const recipientIds = replies
      .map((reply) => reply.authorId)
      .filter(
        (userId) =>
          userId !== actorId &&
          !blockedUserIds.includes(userId),
      );

    await Promise.all(
      recipientIds.map((userId) =>
        this.notifications.create(userId, {
          type: "POST_UPDATED",
          title: "Post updated",
          message: `${actor.username} updated a post you replied to.`,
          link: `/posts/${postId}`,
        }),
      ),
    );
  }

  private async notifyPostCreated(
    actorId: string,
    communityId: string,
    postId: string,
  ) {
    const [actor, blockedUserIds] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: actorId },
        select: { username: true },
      }),
      this.messages.getBlockedUserIds(actorId),
    ]);

    if (!actor) return;

    const members = await this.prisma.communityMember.findMany({
      where: {
        communityId,
        userId: {
          notIn: [actorId, ...blockedUserIds],
        },
      },
      select: { userId: true },
    });

    await Promise.all(
      members.map((member) =>
        this.notifications.create(member.userId, {
          type: "POST_CREATED",
          title: "New post",
          message: `${actor.username} created a new post.`,
          link: `/posts/${postId}`,
        }),
      ),
    );
  }

  private validContent(content: string): string {
    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
      throw new BadRequestException('Post content must contain 1–2000 characters');
    }
    return trimmed;
  }
}
