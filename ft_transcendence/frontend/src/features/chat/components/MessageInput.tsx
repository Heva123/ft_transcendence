import { useState } from 'react'
import ImageAttachmentPicker from './ImageAttachmentPicker'

type Props = {
  onSendMessage: (
    text: string,
    file: File | null,
    onProgress: (value: number) => void,
  ) => Promise<boolean>
  onTypingChange: (typing: boolean) => void
  sendFailed: boolean
  blockedUser: boolean
  onBlockToggle: () => void
}

function MessageInput(props: Props) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextText = event.target.value

    if (!text.trim() && nextText.trim())
      props.onTypingChange(true)
    if (text.trim() && !nextText.trim())
      props.onTypingChange(false)
    setText(nextText)
  }

  async function handleSubmit(event: React.FormEvent) {
    let sent: boolean

    event.preventDefault()
    if (!text.trim() && !file)
      return
    setProgress(0)
    sent = await props.onSendMessage(text, file, setProgress)
    if (!sent)
      return
    props.onTypingChange(false)
    setText('')
    setFile(null)
    setProgress(0)
  }

  return (
    <>
      {props.sendFailed && (
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
            {props.sendFailed ? 'Retry send' : 'Send message'}
          </button>

          <ImageAttachmentPicker
            file={file}
            progress={progress}
            onFileChange={setFile}
          />

          <button type="button" onClick={props.onBlockToggle}>
            {props.blockedUser ? 'Unblock user' : 'Block user'}
          </button>
        </div>
      </form>
    </>
  )
}

export default MessageInput
