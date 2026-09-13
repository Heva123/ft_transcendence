import { useState } from 'react'
import { mockMessages } from '../data/mockMessages'
import type { Message } from '../types/Message'
import MessageInput from './MessageInput'
import MessageList from './MessageList'
import './Chat.css'

type ChatAreaProps = {
  selectedChannelId: number
}

function ChatArea({ selectedChannelId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  function handleSendMessage(text: string) {
    const newMessage: Message = {
      id: messages.length + 1,
      channelId: selectedChannelId,
      sender: 'Afnan',
      text: text,
      createdAt: 'now',
    }

    setMessages([...messages, newMessage])
  }

  return (
    <section className="chat-area">
      <MessageList
        messages={messages}
        selectedChannelId={selectedChannelId}
      />

      <MessageInput onSendMessage={handleSendMessage} />
    </section>
  )
}

export default ChatArea