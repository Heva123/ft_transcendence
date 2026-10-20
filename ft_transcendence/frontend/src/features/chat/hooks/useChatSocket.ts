import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  joinChannel,
  leaveChannel,
  onNewMessage,
  onSocketConnect,
  onTypingStart,
  onTypingStop,
} from '../api/chatSocket'
import { toMessage } from '../api/messageMapper'
import type { Message } from '../types/Message'

// Someone who sent typing:start but nothing since is dropped after this long.
const TYPING_EXPIRY_MS = 6000

type Typist = {
  channelId: string
  username: string
  at: number
}

export function useChatSocket(
  channelId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  onReconnect: () => void,
) {
  const [typists, setTypists] = useState<Record<string, Typist>>({})
  const reconnectRef = useRef(onReconnect)

  useEffect(() => {
    reconnectRef.current = onReconnect
  })

  useEffect(() => {
    let connectedOnce = false

    /*
      The server forgets channel rooms when a socket reconnects.
      Join again on every connect, then reload what was missed.
    */
    function handleConnect() {
      joinChannel({ channelId })
      if (connectedOnce)
        reconnectRef.current()
      connectedOnce = true
    }

    const cleanups = [
      onSocketConnect(handleConnect),
      onNewMessage((item) => {
        if (item.channelId !== channelId)
          return
        setMessages((current) => current.some((m) => m.id === item.id)
          ? current
          : [...current, toMessage(item)])
        setTypists((current) => {
          const next = { ...current }
          delete next[item.author.id]
          return next
        })
      }),
      onTypingStart((data) => {
        if (data.channelId !== channelId)
          return
        setTypists((current) => ({
          ...current,
          [data.userId]: { channelId, username: data.username, at: Date.now() },
        }))
      }),
      onTypingStop((data) => {
        setTypists((current) => {
          const next = { ...current }
          delete next[data.userId]
          return next
        })
      }),
    ]

    joinChannel({ channelId })
    connectedOnce = true

    const timer = window.setInterval(() => {
      setTypists((current) => {
        const now = Date.now()
        const alive = Object.entries(current)
          .filter(([, item]) => now - item.at < TYPING_EXPIRY_MS)
        return alive.length === Object.keys(current).length
          ? current
          : Object.fromEntries(alive)
      })
    }, 1000)

    return () => {
      leaveChannel({ channelId })
      cleanups.forEach((stop) => stop())
      window.clearInterval(timer)
    }
  }, [channelId, setMessages])

  return Object.values(typists)
    .filter((item) => item.channelId === channelId)
    .map((item) => item.username)
}
