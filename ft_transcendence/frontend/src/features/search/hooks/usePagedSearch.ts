import { useEffect, useState } from 'react'
import {
  searchBackend,
  type SearchPagination,
  type SearchRequest,
  type SearchResponse,
} from '../api/searchApi'

type Result = {
  key: string
  data: SearchResponse | null
  error: string
}

const EMPTY: SearchPagination = {
  total: 0, page: 1, limit: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false,
}

export function usePagedSearch<T>(
  request: SearchRequest,
  select: (data: SearchResponse) => T[],
) {
  const key = JSON.stringify(request)
  const [result, setResult] = useState<Result>({ key: '', data: null, error: '' })

  useEffect(() => {
    let active = true

    searchBackend(JSON.parse(key) as SearchRequest)
      .then((data) => {
        if (active)
          setResult({ key, data, error: '' })
      })
      .catch(() => {
        if (active)
          setResult({ key, data: null, error: 'Unable to search right now.' })
      })
    return () => {
      active = false
    }
  }, [key])

  const ready = result.key === key
  const pagination = ready && result.data
    ? result.data.pagination[request.type] ?? EMPTY
    : EMPTY

  return {
    items: ready && result.data ? select(result.data) : [],
    total: pagination.total,
    page: request.page,
    pages: Math.max(1, pagination.totalPages),
    limit: pagination.limit,
    error: ready ? result.error : '',
    loading: !ready,
  }
}
