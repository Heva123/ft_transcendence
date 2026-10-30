import { useEffect, useState } from 'react'
import { getMyCommunities } from '../../chat/api/chatApi'
import { toCommunity } from '../api/communityMapper'
import type { Community } from '../types/Community'

export function useMyCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getMyCommunities()
      .then((items) => setCommunities(items.map(toCommunity)))
      .catch(() => setError('Unable to load communities.'))
  }, [])

  return { communities, error }
}
