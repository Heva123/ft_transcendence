import { apiRequest } from '../../../api/apiClient'

export type SearchUser = {
  id: string
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  skills?: string[]
}

export type SearchCommunity = {
  id: string
  name: string
  description: string | null
}

export type SearchPost = {
  id: string
  content: string
  createdAt: string
  author: SearchUser
  community: {
    id: string
    name: string
  } | null
}

export type SearchType = 'users' | 'skills' | 'communities' | 'posts'
export type SortOrder = 'asc' | 'desc'

export type SearchPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type SearchResponse = {
  results: {
    users: SearchUser[]
    skills: SearchUser[]
    communities: SearchCommunity[]
    posts: SearchPost[]
  }
  pagination: Record<SearchType, SearchPagination>
}

export type SearchRequest = {
  query: string
  type: SearchType
  page: number
  sort: SortOrder
  communityId?: string
}

export const SEARCH_PAGE_SIZE = 5

// Paging, sorting and the community filter all run on the server.
export function searchBackend(request: SearchRequest) {
  const params = new URLSearchParams({
    q: request.query,
    type: request.type,
    page: String(request.page),
    limit: String(SEARCH_PAGE_SIZE),
    sort: request.sort,
  })

  if (request.communityId)
    params.set('communityId', request.communityId)
  return apiRequest<SearchResponse>(`/search?${params}`)
}
