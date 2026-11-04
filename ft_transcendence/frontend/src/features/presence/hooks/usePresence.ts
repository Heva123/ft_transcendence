import { useEffect, useState } from 'react'
import {
  onPresenceOffline,
  onPresenceOnline,
  onPresenceSnapshot,
  onSocketConnect,
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

    const cleanups = [
      onPresenceSnapshot(snapshot),
      onPresenceOnline(online),
      onPresenceOffline(offline),

      onSocketConnect(requestPresence),
    ]
    requestPresence()

    return () => cleanups.forEach((stop) => stop())
  }, [])

  return users
}
