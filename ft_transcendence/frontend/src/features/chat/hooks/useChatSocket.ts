import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  joinChannel,
  leaveChannel,
  onNewMessage,
  onTypingStart,
  onTypingStop,
  removeChatListeners,
} from '../api/chatSocket'
import type { Message } from '../types/Message'

export function useChatSocket(
  channelId: string,
  setMessages: Dispatch<SetStateAction<Message[]>>,
) {
  const [typingUser, setTypingUser] = useState('')

  useEffect(() => {
    setTypingUser('')
    joinChannel({ channelId })
    onNewMessage((message) =>
      setMessages((current) => [...current, message]))
    onTypingStart((data) => {
      if (data.channelId === channelId)
        setTypingUser(data.username)
    })
    onTypingStop((data) => {
      if (data.channelId === channelId)
        setTypingUser('')
    })
    return () => {
      leaveChannel({ channelId })
      removeChatListeners()
    }
  }, [channelId, setMessages])

  return typingUser
}
