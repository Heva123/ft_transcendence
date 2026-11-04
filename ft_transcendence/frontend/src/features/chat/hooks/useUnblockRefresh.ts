import { useEffect } from 'react'
import { onUserUnblocked } from '../api/chatSocket'


export function useUnblockRefresh(onRefresh: () => void) {
  useEffect(() => onUserUnblocked(() => onRefresh()), [onRefresh])
}
