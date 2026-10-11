import { useEffect, useState } from 'react'
import {
  searchBackend,
  type SearchResponse,
  type SearchType,
} from '../api/searchApi'

export function useSearchData(query: string, type: SearchType) {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null)
    setError('')
    searchBackend(query, type)
      .then(setData)
      .catch(() => setError('Unable to search right now.'))
  }, [query, type])

  return { data, error }
}
