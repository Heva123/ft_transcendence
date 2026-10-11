import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  offUserUnblocked,
  onUserUnblocked,
} from '../api/chatSocket'
import { getMessages } from '../api/chatApi'
import { toMessage } from '../api/messageMapper'
import type { Message } from '../types/Message'

type MessageSetter = Dispatch<SetStateAction<Message[]>>

export function useUnblockRefresh(
  channelId: string,
  setMessages: MessageSetter,
) {
  useEffect(() => {
    function handleUnblocked() {
      getMessages(channelId)
        .then((items) => setMessages(items.map(toMessage)))
        .catch(() => undefined)
    }

    onUserUnblocked(handleUnblocked)
    return () => offUserUnblocked(handleUnblocked)
  }, [channelId, setMessages])
}
