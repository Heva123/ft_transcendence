export type Author = {
  id: string
  username: string
  avatarUrl: string | null
}

export type CommunitySummary = {
  id: string
  name: string
}

export type Post = {
  id: string
  content: string
  imageUrl?: string | null
  author: Author
  community: CommunitySummary | null
  createdAt: string
  likesCount: number
  commentsCount: number
  likedByMe: boolean
}