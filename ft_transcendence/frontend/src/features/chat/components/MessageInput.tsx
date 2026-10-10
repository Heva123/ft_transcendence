import { useState } from 'react'
import ImageAttachmentPicker from './ImageAttachmentPicker'

type MessageInputProps = {
  onSendMessage: (text: string, file: File | null) => boolean
  onTypingChange: (typing: boolean) => void
  sendFailed: boolean
  blockedUser: boolean
  onBlockToggle: () => void
}

function MessageInput({
  onSendMessage,
  onTypingChange,
  sendFailed,
  blockedUser,
  onBlockToggle,
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextText = event.target.value

    if (!text.trim() && nextText.trim())
      onTypingChange(true)
    if (text.trim() && !nextText.trim())
      onTypingChange(false)
    setText(nextText)
  }

  function handleSubmit(event: React.FormEvent) {
    let sent: boolean

    event.preventDefault()
    if (!text.trim() && !file)
      return
    sent = onSendMessage(text, file)
    if (!sent)
      return
    onTypingChange(false)
    setText('')
    setFile(null)
  }

  return (
    <>
      {sendFailed && (
        <p className="message-send-error">
          Message not sent. Your draft is saved below.
        </p>
      )}

      <form className="message-composer" onSubmit={handleSubmit}>
        <label htmlFor="message-input">Message</label>
        <input id="message-input" value={text}
          onChange={handleChange} placeholder="Write a message..." />

        <div className="message-actions">
          <button type="submit">
            {sendFailed ? 'Retry send' : 'Send message'}
          </button>
          <ImageAttachmentPicker file={file} onFileChange={setFile} />
          <button type="button" onClick={onBlockToggle}>
            {blockedUser ? 'Unblock user' : 'Block user'}
          </button>
        </div>
      </form>
    </>
  )
}

export default MessageInput
