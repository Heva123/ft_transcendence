export type Author = {
  id: number
  username: string
  avatarUrl: string | null
}

export type CommunitySummary = {
  id: number
  name: string
}

export type Post = {
  id: number
  content: string
  author: Author
  community: CommunitySummary | null
  createdAt: string
  likesCount: number
  commentsCount: number
  likedByMe: boolean
}