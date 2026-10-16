import { useEffect, useRef, useState } from 'react'
import ImageAttachmentPicker from './ImageAttachmentPicker'

export const MAX_MESSAGE_LENGTH = 2000
// Send typing:stop if the user has not typed for this long.
const TYPING_IDLE_MS = 3000

type Props = {
  text: string
  onTextChange: (text: string) => void
  onSendMessage: (
    text: string,
    file: File | null,
    onProgress: (value: number) => void,
  ) => Promise<boolean>
  onTypingChange: (typing: boolean) => void
  sendError: string
  canBlock: boolean
  onBlock: () => void
}

function MessageInput(props: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const typing = useRef(false)
  const idleTimer = useRef<number | undefined>(undefined)
  const { onTypingChange } = props

  function stopTyping() {
    window.clearTimeout(idleTimer.current)
    if (typing.current) {
      typing.current = false
      onTypingChange(false)
    }
  }

  // Tell others we stopped typing when leaving the channel.
  useEffect(() => () => {
    window.clearTimeout(idleTimer.current)
    if (typing.current)
      onTypingChange(false)
  }, [onTypingChange])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextText = event.target.value

    props.onTextChange(nextText)
    if (!nextText.trim()) {
      stopTyping()
      return
    }
    if (!typing.current) {
      typing.current = true
      onTypingChange(true)
    }
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(stopTyping, TYPING_IDLE_MS)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!props.text.trim() && !file)
      return
    stopTyping()
    setProgress(0)
    const sent = await props.onSendMessage(props.text, file, setProgress)
    if (!sent)
      return
    setFile(null)
    setProgress(0)
  }

  const tooLong = props.text.length > MAX_MESSAGE_LENGTH

  return (
    <>
      {props.sendError && (
        <p className="message-send-error" role="alert">
          Message not sent. {props.sendError} Your draft is saved below.
        </p>
      )}

      <form className="message-composer" onSubmit={handleSubmit}>
        <label htmlFor="message-input">Message</label>
        <input id="message-input" value={props.text}
          onChange={handleChange} placeholder="Write a message..."
          aria-invalid={tooLong} />
        <p className={tooLong ? 'message-counter over' : 'message-counter'}>
          {props.text.length}/{MAX_MESSAGE_LENGTH}
        </p>

        <div className="message-actions">
          <button type="submit" disabled={tooLong}>
            {props.sendError ? 'Retry send' : 'Send message'}
          </button>

          <ImageAttachmentPicker
            file={file}
            progress={progress}
            onFileChange={setFile}
          />

          {props.canBlock && (
            <button type="button" onClick={props.onBlock}>
              Block user
            </button>
          )}
        </div>
      </form>
    </>
  )
}

export default MessageInput
