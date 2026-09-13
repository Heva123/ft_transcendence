import { useState } from 'react'

type MessageInputProps = {
  onSendMessage: (text: string) => void
}

function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (text.trim() === '')
      return

    onSendMessage(text)
    setText('')
  }

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <label htmlFor="message-input">Message</label>

      <input
        id="message-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a message..."
      />

      <div className="message-actions">
        <button type="submit">Send message</button>
        <button type="button">Attach image</button>
        <button type="button">Block user</button>
      </div>
    </form>
  )
}

export default MessageInput