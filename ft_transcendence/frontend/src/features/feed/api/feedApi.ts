import { apiRequest, uploadRequest } from '../../../api/apiClient'
import type { Post } from '../types/Post'

type FeedResponse = {
  posts: Post[]
}

type CreatePostInput = {
  content: string
  communityId: string | null
}

export function getFeed() {
  return apiRequest<FeedResponse>('/posts')
}

export function createPost(data: CreatePostInput) {
  return apiRequest<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function uploadPostImage(
  postId: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return uploadRequest(
    `/uploads/post/${postId}`,
    file,
    onProgress,
  )
}

export function getCommunityFeed(communityId: string) {
  return apiRequest<FeedResponse>(
    `/posts?communityId=${encodeURIComponent(communityId)}`,
  )
}

import type { Reply } from '../types/Reply'

type PostDetails = {
  post: Post
  comments: Reply[]
}

type LikeResponse = {
  liked: boolean
  likesCount: number
}

export function getPostDetails(postId: string) {
  return apiRequest<PostDetails>(`/posts/${postId}`)
}

export function createReply(postId: string, content: string) {
  return apiRequest<Reply>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function togglePostLike(postId: string) {
  return apiRequest<LikeResponse>(`/posts/${postId}/likes`, {
    method: 'POST',
  })
}
