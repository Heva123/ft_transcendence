type PublicAuthor = { id: string; username: string };

type PostRecord = {
  id: string;
  content: string;
  createdAt: Date;
  author: PublicAuthor;
  community: { id: string; name: string } | null;
  _count: { likes: number; comments: number };
  likes: { userId: string }[];
};

type ReplyRecord = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  author: PublicAuthor;
};

export function toPostResponse(post: PostRecord) {
  return {
    id: post.id,
    content: post.content,
    author: {
      id: post.author.id,
      username: post.author.username,
      avatarUrl: null,
    },
    community: post.community
      ? { id: post.community.id, name: post.community.name }
      : null,
    createdAt: post.createdAt.toISOString(),
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByMe: post.likes.length > 0,
  };
}

export function toReplyResponse(reply: ReplyRecord) {
  return {
    id: reply.id,
    postId: reply.postId,
    parentId: reply.parentId,
    content: reply.content,
    author: {
      id: reply.author.id,
      username: reply.author.username,
      avatarUrl: null,
    },
    createdAt: reply.createdAt.toISOString(),
  };
}
