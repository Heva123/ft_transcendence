import { apiRequest, uploadRequest } from '../../../api/apiClient'
import type { Post } from '../types/Post'
import type { Reply } from '../types/Reply'

type FeedResponse = { posts: Post[] }
type CreatePostInput = { content: string; communityId: string | null }
type PostDetails = { post: Post; comments: Reply[] }
type LikeResponse = { liked: boolean; likesCount: number }
type DeleteResponse = { deleted: boolean; id: string }

export function getFeed() {
  return apiRequest<FeedResponse>('/posts')
}

export function getCommunityFeed(communityId: string) {
  return apiRequest<FeedResponse>(
    `/posts?communityId=${encodeURIComponent(communityId)}`,
  )
}

export function getPostDetails(postId: string) {
  return apiRequest<PostDetails>(`/posts/${postId}`)
}

export function createPost(data: CreatePostInput) {
  return apiRequest<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePost(postId: string, content: string) {
  return apiRequest<Post>(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export function deletePost(postId: string) {
  return apiRequest<DeleteResponse>(`/posts/${postId}`, {
    method: 'DELETE',
  })
}

export function createReply(postId: string, content: string) {
  return apiRequest<Reply>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function updateReply(postId: string, replyId: string, content: string) {
  return apiRequest<Reply>(`/posts/${postId}/comments/${replyId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export function deleteReply(postId: string, replyId: string) {
  return apiRequest<DeleteResponse>(`/posts/${postId}/comments/${replyId}`, {
    method: 'DELETE',
  })
}

export function togglePostLike(postId: string) {
  return apiRequest<LikeResponse>(`/posts/${postId}/likes`, {
    method: 'POST',
  })
}

export function uploadPostImage(
  postId: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return uploadRequest(`/uploads/post/${postId}`, file, onProgress)
}
