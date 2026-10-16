import { useEffect } from 'react'
import { onUserUnblocked } from '../api/chatSocket'

// Someone unblocked us: their side of the history becomes visible again.
export function useUnblockRefresh(onRefresh: () => void) {
  useEffect(() => onUserUnblocked(() => onRefresh()), [onRefresh])
}
