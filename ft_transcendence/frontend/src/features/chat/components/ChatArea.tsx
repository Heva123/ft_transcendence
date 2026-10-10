import { useState } from 'react'
import { socket } from '../../../api/socket'
import { sendMessage, startTyping, stopTyping } from '../api/chatSocket'
import { mockMessages } from '../data/mockMessages'
import { useChatSocket } from '../hooks/useChatSocket'
import { useSocketStatus } from '../hooks/useSocketStatus'
import type { Message } from '../types/Message'
import BlockUserModal from './BlockUserModal'
import ConnectionStatus from './ConnectionStatus'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import './Chat.css'

type ChatAreaProps = {
  selectedChannelId: string
}

function ChatArea({ selectedChannelId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [sendFailed, setSendFailed] = useState(false)
  const [blockedUser, setBlockedUser] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const typingUser = useChatSocket(selectedChannelId, setMessages)
  const socketStatus = useSocketStatus()

  function handleSendMessage(text: string, file: File | null) {
    let message: Message

    if (socketStatus === 'reconnecting') {
      setSendFailed(true)
      return false
    }
    if (socket.connected) {
      if (file) {
        setSendFailed(true)
        return false
      }
      sendMessage({ channelId: selectedChannelId, text })
      setSendFailed(false)
      return true
    }
    message = {
      id: Date.now().toString(),
      channelId: selectedChannelId,
      senderId: 'me',
      sender: 'You',
      text,
      createdAt: 'now',
      attachment: file ? {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      } : undefined,
    }
    setMessages((current) => [...current, message])
    setSendFailed(false)
    return true
  }

  function handleTypingChange(typing: boolean) {
    if (!socket.connected)
      return
    if (typing)
      startTyping({ channelId: selectedChannelId })
    else
      stopTyping({ channelId: selectedChannelId })
  }

  function handleBlockToggle() {
    if (blockedUser)
      setBlockedUser('')
    else
      setShowBlockModal(true)
  }

  return (
    <section className="chat-area">
      <MessageList
        messages={messages}
        selectedChannelId={selectedChannelId}
        typingUser={typingUser}
        blockedUser={blockedUser}
      />
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
        sendFailed={sendFailed}
        blockedUser={Boolean(blockedUser)}
        onBlockToggle={handleBlockToggle}
      />
      <ConnectionStatus status={socketStatus} />
      {showBlockModal && (
        <BlockUserModal
          username="Afnan"
          onCancel={() => setShowBlockModal(false)}
          onConfirm={() => {
            setBlockedUser('Afnan')
            setShowBlockModal(false)
          }}
        />
      )}
    </section>
  )
}

export default ChatArea
