import { useRef, useState, type ChangeEvent } from 'react'
import { ApiError } from '../../../api/apiClient'
import { IMAGE_TYPES, validateImage } from '../../../utils/validateImage'

type Props = {
  hasImage: boolean
  onRemove: () => void
  onAdd: (file: File, onProgress: (value: number) => void) => Promise<void>
}

// While editing a post: remove its image, or add one with progress.
function PostImageEditor({ hasImage, onRemove, onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState({ progress: 0, uploading: false, error: '' })

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    event.target.value = ''
    if (!file)
      return
    const validation = validateImage(file)
    if (validation) {
      setState({ progress: 0, uploading: false, error: validation })
      return
    }
    setState({ progress: 0, uploading: true, error: '' })
    try {
      await onAdd(file, (progress) => setState((current) => ({ ...current, progress })))
      setState({ progress: 0, uploading: false, error: '' })
    } catch (err) {
      setState({
        progress: 0,
        uploading: false,
        error: err instanceof ApiError && err.status === 413
          ? 'That image is too large.'
          : 'The image could not be uploaded.',
      })
    }
  }

  return (
    <div className="post-image-editor">
      {hasImage
        ? <button type="button" onClick={onRemove}>Remove image</button>
        : <>
          <button type="button" disabled={state.uploading}
            onClick={() => inputRef.current?.click()}>
            {state.uploading ? `Uploading… ${state.progress}%` : '+ Add image'}
          </button>
          <input ref={inputRef} type="file" hidden aria-label="Add an image to this post"
            accept={IMAGE_TYPES.join(',')} onChange={handleChange} />
        </>}
      {state.uploading && <progress max="100" value={state.progress} />}
      {state.error && <p className="post-card__error" role="alert">{state.error}</p>}
    </div>
  )
}

export default PostImageEditor
