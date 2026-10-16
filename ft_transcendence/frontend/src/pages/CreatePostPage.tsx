import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import { getMyCommunities, type ApiCommunity } from '../features/chat/api/chatApi'
import { createPost, deletePost, uploadPostImage } from '../features/feed/api/feedApi'
import PostImageField from '../features/feed/components/PostImageField'
import { validateImage } from '../utils/validateImage'
import './CreatePostPage.css'

type View = {
  error: string
  file: File | null
  progress: number
  uploading: boolean
  publishing: boolean
}

class ImageUploadError extends Error {}

/*
  The post is created first, because the image endpoint needs the post id.
  If the image then fails, the post is deleted again so no half post is left.
*/
async function publish(
  content: string,
  target: string,
  file: File | null,
  onProgress: (value: number) => void,
  onUploadStart: () => void,
) {
  const post = await createPost({
    content,
    communityId: target === 'global' ? null : target,
  })
  if (!file)
    return
  try {
    onUploadStart()
    await uploadPostImage(post.id, file, onProgress)
  } catch (err) {
    await deletePost(post.id).catch(() => undefined)
    const reason = err instanceof ApiError && err.status === 413
      ? 'The image is too large.'
      : 'The image could not be uploaded.'
    throw new ImageUploadError(`${reason} Your post was not published.`)
  }
}

function CreatePostPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [target, setTarget] = useState(() => searchParams.get('community') ?? 'global')
  const [content, setContent] = useState('')
  const [view, setView] = useState<View>({ error: '', file: null, progress: 0, uploading: false, publishing: false })

  useEffect(() => {
    getMyCommunities().then(setCommunities)
      .catch(() => setView((state) => ({ ...state, error: 'Unable to load communities.' })))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = content.trim()

    if (!text) {
      setView((state) => ({ ...state, error: 'Write something before publishing.' }))
      return
    }
    const fileError = view.file ? validateImage(view.file) : ''
    if (fileError) {
      setView((state) => ({ ...state, error: fileError }))
      return
    }
    setView((state) => ({ ...state, error: '', progress: 0, publishing: true }))
    try {
      await publish(text, target, view.file,
        (progress) => setView((state) => ({ ...state, progress })),
        () => setView((state) => ({ ...state, uploading: true })))
      navigate(target === 'global' ? '/' : `/communities/${target}`)
    } catch (err) {
      setView((state) => ({
        ...state,
        publishing: false,
        uploading: false,
        progress: 0,
        error: err instanceof ImageUploadError
          ? err.message
          : 'Unable to publish post.',
      }))
    }
  }

  return <section className="create-post-page">
    <header><p>42 COMMUNITY</p><h1>Share something.</h1><p>Make a little change. Keep building.</p></header>
    <form className="create-post-form" onSubmit={handleSubmit}>
      <label htmlFor="post-target">Post to</label>
      <select id="post-target" name="target" value={target} onChange={(event) => setTarget(event.target.value)}>
        <option value="global">Global feed</option>
        {communities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <label htmlFor="post-idea">Your idea</label>
      <textarea id="post-idea" name="idea" rows={7} maxLength={2000} placeholder="What would you like to share?"
        value={content} onChange={(event) => setContent(event.target.value)} />
      <p className="attachment-note">{content.length}/2000</p>
      <PostImageField file={view.file} progress={view.progress} uploading={view.uploading}
        onFileChange={(file) => setView((state) => ({ ...state, file, error: '' }))} />
      {view.error && <p className="create-post-error" role="alert">{view.error}</p>}
      <div className="create-post-actions">
        <button type="submit" disabled={view.publishing}>{view.publishing ? 'Publishing…' : 'Publish post'}</button>
        <button type="button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  </section>
}

export default CreatePostPage
