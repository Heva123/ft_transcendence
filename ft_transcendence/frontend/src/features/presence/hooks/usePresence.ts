import { useEffect, useState } from 'react'
import {
  offPresenceOffline,
  offPresenceOnline,
  offPresenceSnapshot,
  onPresenceOffline,
  onPresenceOnline,
  onPresenceSnapshot,
  requestPresence,
} from '../../chat/api/chatSocket'
import type { PresencePayload } from '../../chat/types/SocketEvents'

type Event = Omit<PresencePayload, 'online'>

export function usePresence() {
  const [users, setUsers] = useState<PresencePayload[]>([])

  useEffect(() => {
    function snapshot(items: Event[]) {
      setUsers(items.map((item) => ({ ...item, online: true })))
    }

    function online(data: Event) {
      setUsers((current) => [
        ...current.filter((item) => item.userId !== data.userId),
        { ...data, online: true },
      ])
    }

    function offline(data: Event) {
      setUsers((current) =>
        current.filter((item) => item.userId !== data.userId))
    }

    onPresenceSnapshot(snapshot)
    onPresenceOnline(online)
    onPresenceOffline(offline)
    requestPresence()

    return () => {
      offPresenceSnapshot(snapshot)
      offPresenceOnline(online)
      offPresenceOffline(offline)
    }
  }, [])

  return users
}
