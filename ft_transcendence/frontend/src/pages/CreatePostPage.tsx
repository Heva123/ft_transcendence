import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockCommunities } from '../features/chat/data/mockCommunities'
import { addMockPost } from '../features/feed/data/mockPosts'
import './CreatePostPage.css'

function CreatePostPage() {
  let navigate: ReturnType<typeof useNavigate>
  let params: URLSearchParams
  let communityId: number
  let defaultTarget: string

  navigate = useNavigate()
  params = new URLSearchParams(window.location.search)
  communityId = Number(params.get('community'))
  defaultTarget = communityId ? String(communityId) : 'global'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    let form: FormData
    let idea: string
    let target: string
    let community: string | null

    event.preventDefault()
    form = new FormData(event.currentTarget)
    idea = String(form.get('idea')).trim()
    target = String(form.get('target'))
    community = mockCommunities.find(
      (item) => item.id === Number(target),
    )?.name ?? null

    if (!idea)
      return

    addMockPost(idea, community)
    navigate(community ? `/communities/${target}` : '/')
  }

  return (
    <section className="create-post-page">
      <header>
        <p>42 COMMUNITY</p>
        <h1>Share something.</h1>
        <p>Make a little change. Keep building.</p>
      </header>

      <form className="create-post-form" onSubmit={handleSubmit}>
        <label htmlFor="post-target">Post to</label>

        <select
          id="post-target"
          name="target"
          defaultValue={defaultTarget}
        >
          <option value="global">Global feed</option>

          {mockCommunities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </select>

        <label htmlFor="post-idea">Your idea</label>

        <textarea
          id="post-idea"
          name="idea"
          rows={7}
          placeholder="What would you like to share?"
        />

        <label htmlFor="post-image">Attachment</label>

        <input
          id="post-image"
          type="file"
          accept="image/*"
        />

        <p className="attachment-note">+ Add image · optional</p>

        <div className="create-post-actions">
          <button type="submit">Publish post</button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreatePostPage