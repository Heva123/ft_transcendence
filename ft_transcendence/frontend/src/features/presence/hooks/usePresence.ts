import { useEffect, useState } from 'react'
import {
  offPresenceUpdate,
  onPresenceUpdate,
} from '../../chat/api/chatSocket'
import type { PresencePayload } from '../../chat/types/SocketEvents'

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<PresencePayload[]>([])

  useEffect(() => {
    function handlePresence(data: PresencePayload) {
      setOnlineUsers((current) => {
        const others = current.filter(
          (user) => user.userId !== data.userId,
        )

        return data.online ? [...others, data] : others
      })
    }

    onPresenceUpdate(handlePresence)
    return () => offPresenceUpdate(handlePresence)
  }, [])

  return onlineUsers
}
