import { useEffect, useState } from 'react'
import { socket } from '../../../api/socket'
import { useCurrentUser } from '../../auth/hooks/useCurrentUser'
import { getMessages } from '../api/chatApi'
import { uploadChatAttachment } from '../api/chatAttachmentApi'
import { toMessage } from '../api/messageMapper'
import { sendMessage, startTyping, stopTyping } from '../api/chatSocket'
import { useBlockFlow } from '../hooks/useBlockFlow'
import { useChatSocket } from '../hooks/useChatSocket'
import { useReadReceipts } from '../hooks/useReadReceipts'
import { useSocketStatus } from '../hooks/useSocketStatus'
import { useUnblockRefresh } from '../hooks/useUnblockRefresh'
import type { Message } from '../types/Message'
import BlockUserModal from './BlockUserModal'
import BlockUserPickerModal from './BlockUserPickerModal'
import ConnectionStatus from './ConnectionStatus'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import './Chat.css'

type ChatAreaProps = {
  selectedChannelId: string
}

function ChatArea({ selectedChannelId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [sendFailed, setSendFailed] = useState(false)
  const typingUser = useChatSocket(selectedChannelId, setMessages)
  const socketStatus = useSocketStatus()
  const currentUser = useCurrentUser()
  async function reloadMessages() {
    const items = await getMessages(selectedChannelId)

    setMessages(items.map(toMessage))
  }

  const block = useBlockFlow(
    selectedChannelId,
    currentUser?.id ?? '',
    reloadMessages,
  )

  useReadReceipts(
    selectedChannelId,
    messages,
    setMessages,
    currentUser?.id ?? '',
  )

  useUnblockRefresh(selectedChannelId, setMessages)

  useEffect(() => {
    getMessages(selectedChannelId)
      .then((items) => setMessages(items.map(toMessage)))
      .catch(() => setMessages([]))
  }, [selectedChannelId])

  async function handleSendMessage(
    text: string,
    file: File | null,
    onProgress: (value: number) => void,
  ) {
    let attachment

    if (!socket.connected) {
      setSendFailed(true)
      return false
    }
    try {
      attachment = file
        ? await uploadChatAttachment(
          selectedChannelId, file, onProgress)
        : undefined
      sendMessage({
        channelId: selectedChannelId,
        content: text,
        attachmentId: attachment?.id,
      })
      setSendFailed(false)
      return true
    } catch {
      setSendFailed(true)
      return false
    }
  }

  function handleTypingChange(typing: boolean) {
    if (!socket.connected)
      return
    if (typing)
      startTyping({ channelId: selectedChannelId })
    else
      stopTyping({ channelId: selectedChannelId })
  }

  return (
    <section className="chat-area">
      <MessageList
        messages={messages}
        selectedChannelId={selectedChannelId}
        typingUser={typingUser}
        blockedUser={block.state.blocked?.username ?? ''}
        currentUserId={currentUser?.id ?? ''}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
        sendFailed={sendFailed}
        blockedUser={Boolean(block.state.blocked)}
        onBlockToggle={block.toggle}
      />

      <ConnectionStatus status={socketStatus} />

      {block.state.mode === 'pick' && (
        <BlockUserPickerModal
          users={block.state.candidates}
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
