import { useEffect, useState } from 'react'
import { getUnreadCount } from '../api/chatApi'

// The socket only joins the open channel, so other channels are polled.
const POLL_MS = 10000

/** Unread message count per channel. The open channel always counts as read. */
export function useChannelUnread(channelIds: string[], activeId: string) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const key = channelIds.join(',')

  useEffect(() => {
    let active = true
    const ids = key ? key.split(',') : []

    function load() {
      Promise.all(ids.map((id) => getUnreadCount(id)
        .then((data) => [id, data.unreadCount] as const)
        .catch(() => [id, 0] as const)))
        .then((entries) => {
          if (active)
            setCounts(Object.fromEntries(entries))
        })
    }

    load()
    const timer = window.setInterval(load, POLL_MS)
    window.addEventListener('focus', load)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [key, activeId])

  return (id: string) => (id === activeId ? 0 : counts[id] ?? 0)
}
