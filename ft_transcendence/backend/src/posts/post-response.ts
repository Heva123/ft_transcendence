type PublicAuthor = {
  id: string;
  username: string;
  avatarPath: string | null;
};

type PostRecord = {
  id: string;
  content: string;
  imagePath: string | null;
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
    imageUrl: post.imagePath
      ? `/api/uploads/post/${post.id}`
      : null,
    author: {
      id: post.author.id,
      username: post.author.username,
      avatarUrl: post.author.avatarPath
        ? `/api/uploads/avatar/${post.author.id}`
        : null,
    },
    community: post.community
      ? {
          id: post.community.id,
          name: post.community.name,
        }
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
      avatarUrl: reply.author.avatarPath
        ? `/api/uploads/avatar/${reply.author.id}`
        : null,
    },
    createdAt: reply.createdAt.toISOString(),
  };
}
