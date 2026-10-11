
import { useEffect, useState } from 'react'
import type {
  SearchResponse,
  SearchType,
} from '../api/searchApi'
import { useSearchData } from './useSearchData'

export function usePagedSearch<T>(
  query: string,
  type: SearchType,
  select: (data: SearchResponse) => T[],
  compare?: (a: T, b: T) => number,
) {
  const pageState = useState(1)
  const result = useSearchData(query, type)
  let items: T[]
  let pages: number

  items = result.data ? select(result.data) : []
  if (compare)
    items = [...items].sort(compare)
  pages = Math.max(1, Math.ceil(items.length / 3))

  useEffect(() => pageState[1](1), [query, type])

  return {
    items: items.slice((pageState[0] - 1) * 3, pageState[0] * 3),
    total: items.length,
    page: pageState[0],
    pages,
    setPage: pageState[1],
    error: result.error,
    loading: !result.data,
  }
}
