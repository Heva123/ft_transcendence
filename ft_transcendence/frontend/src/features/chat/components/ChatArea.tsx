import { useCallback, useEffect, useRef, useState } from 'react'
import { socket } from '../../../api/socket'
import { useCurrentUser } from '../../auth/hooks/useCurrentUser'
import { getMessages } from '../api/chatApi'
import { uploadChatAttachment } from '../api/chatAttachmentApi'
import { toMessage } from '../api/messageMapper'
import {
  onMessageError,
  sendMessage,
  startTyping,
  stopTyping,
} from '../api/chatSocket'
import { useBlockFlow } from '../hooks/useBlockFlow'
import { useChatSocket } from '../hooks/useChatSocket'
import { useReadReceipts } from '../hooks/useReadReceipts'
import { useSocketStatus } from '../hooks/useSocketStatus'
import { useUnblockRefresh } from '../hooks/useUnblockRefresh'
import type { ChannelMember, Message } from '../types/Message'
import BlockUserModal from './BlockUserModal'
import BlockUserPickerModal from './BlockUserPickerModal'
import ConnectionStatus from './ConnectionStatus'
import MessageHistory from './MessageHistory'
import MessageInput, { MAX_MESSAGE_LENGTH } from './MessageInput'
import MessageList from './MessageList'
import './Chat.css'

// The live view shows the latest messages. "Earlier messages" shows everything.
const LIVE_LIMIT = 50

type ChatAreaProps = {
  selectedChannelId: string
  members: ChannelMember[]
  showHistory: boolean
}

function ChatArea({ selectedChannelId, members, showHistory }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const pending = useRef<string | null>(null)
  const socketStatus = useSocketStatus()
  const currentUser = useCurrentUser()
  const currentUserId = currentUser?.id ?? ''

  const reloadMessages = useCallback(() => {
    getMessages(selectedChannelId)
      .then((items) => setMessages(items.map(toMessage)))
      .catch(() => undefined)
  }, [selectedChannelId])

  const typingUsers = useChatSocket(selectedChannelId, setMessages, reloadMessages)
  const block = useBlockFlow(members, currentUserId, reloadMessages)
  const names = new Map(members.map((member) => [member.id, member.username]))

  useReadReceipts(selectedChannelId, messages, setMessages, currentUserId)
  useUnblockRefresh(reloadMessages)

  useEffect(() => {
    let active = true

    getMessages(selectedChannelId)
      .then((items) => {
        if (active)
          setMessages(items.map(toMessage))
      })
      .catch(() => {
        if (active)
          setMessages([])
      })
    return () => {
      active = false
    }
  }, [selectedChannelId])

  /*
    The server answers a refused message with message:error.
    Put the text back in the box and say why.
  */
  useEffect(() => onMessageError((data) => {
    if (pending.current === null)
      return
    setDraft(pending.current)
    pending.current = null
    setSendError(data.message ? `${data.message}.` : '')
  }), [])

  // Our own message came back from the server, so the send worked.
  useEffect(() => {
    const last = messages[messages.length - 1]

    if (last && last.senderId === currentUserId)
      pending.current = null
  }, [messages, currentUserId])

  async function handleSendMessage(
    text: string,
    file: File | null,
    onProgress: (value: number) => void,
  ) {
    if (!socket.connected) {
      setSendError('You are offline.')
      return false
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      setSendError(`Messages can be at most ${MAX_MESSAGE_LENGTH} characters.`)
      return false
    }
    try {
      const attachment = file
        ? await uploadChatAttachment(selectedChannelId, file, onProgress)
        : undefined
      pending.current = text
      sendMessage({
        channelId: selectedChannelId,
        content: text,
        attachmentId: attachment?.id,
      })
      setSendError('')
      setDraft('')
      return true
    } catch {
      setSendError('The image could not be uploaded.')
      return false
    }
  }

  const handleTypingChange = useCallback((typing: boolean) => {
    if (!socket.connected)
      return
    if (typing)
      startTyping({ channelId: selectedChannelId })
    else
      stopTyping({ channelId: selectedChannelId })
  }, [selectedChannelId])

  const visible = messages.filter((message) =>
    !block.blockedIds.has(message.senderId))
  const live = visible.slice(-LIVE_LIMIT)
  const blockedTypists = new Set(block.state.blocked.map((user) => user.username))

  return (
    <section className="chat-area">
      <ConnectionStatus status={socketStatus} />

      {showHistory
        ? <MessageHistory messages={visible} currentUserId={currentUserId} names={names} />
        : <>
          {visible.length > live.length && (
            <p className="message-earlier-note">
              Showing the latest {LIVE_LIMIT} messages. Use “Earlier messages” for the full history.
            </p>
          )}
          <MessageList
            messages={live}
            currentUserId={currentUserId}
            names={names}
            typingUsers={typingUsers.filter((name) => !blockedTypists.has(name))}
          />
        </>}

      {block.state.blocked.map((user) => (
        <p key={user.id} className="blocked-status">
          {user.username} is blocked. Their messages are hidden for you.
          {' '}
          <button type="button" onClick={() => block.unblock(user)}>Unblock</button>
        </p>
      ))}
      {block.state.error && <p className="blocked-status" role="alert">{block.state.error}</p>}

      <MessageInput
        text={draft}
        onTextChange={setDraft}
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
        sendError={sendError}
        canBlock={block.candidates.length > 0}
        onBlock={block.open}
      />

      {block.state.mode === 'pick' && (
        <BlockUserPickerModal
          users={block.candidates}
          onSelect={block.select}
          onCancel={block.cancel}
        />
      )}

      {block.state.mode === 'confirm' && block.state.selected && (
        <BlockUserModal
          username={block.state.selected.username}
          onCancel={block.cancel}
          onConfirm={block.confirm}
        />
      )}
    </section>
  )
}

export default ChatArea
