import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { ApiError } from '../../../api/apiClient'
import { updateCurrentUser, type CurrentUser } from '../../auth/api/userApi'
import '../../friends/components/Friends.css'
import { MAX_BIO, MAX_SKILLS } from '../api/profileApi'
import './Profile.css'

type Props = {
  user: CurrentUser
  onSaved: (user: CurrentUser) => void
}

const SKILL_PATTERN = /^[\p{L}\p{N} +#./_-]{1,30}$/u

// Display name, bio and skills (design p62 "Things I work with", p65).
function ProfileAboutCard({ user, onSaved }: Props) {
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName ?? '')
  const [bio, setBio] = useState(user.bio ?? '')
  const [skills, setSkills] = useState<string[]>(user.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [status, setStatus] = useState({ saving: false, error: '', saved: false })

  function addSkill() {
    const value = skillInput.trim()

    if (!value)
      return
    if (!SKILL_PATTERN.test(value)) {
      setStatus({ saving: false, saved: false, error: 'Skills use letters, numbers, spaces and + # . / _ - (max 30).' })
      return
    }
    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkillInput('')
      return
    }
    if (skills.length >= MAX_SKILLS) {
      setStatus({ saving: false, saved: false, error: `You can list up to ${MAX_SKILLS} skills.` })
      return
    }
    setSkills([...skills, value])
    setSkillInput('')
    setStatus({ saving: false, saved: false, error: '' })
  }

  function handleSkillKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkill()
    }
  }

  function cancel() {
    setDisplayName(user.displayName ?? '')
    setBio(user.bio ?? '')
    setSkills(user.skills ?? [])
    setSkillInput('')
    setStatus({ saving: false, saved: false, error: '' })
    setEditing(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus({ saving: true, saved: false, error: '' })
    try {
      const updated = await updateCurrentUser({
        displayName: displayName.trim(),
        bio: bio.trim(),
        skills,
      })
      onSaved(updated)
      setStatus({ saving: false, saved: true, error: '' })
      setEditing(false)
    } catch (err) {
      setStatus({
        saving: false,
        saved: false,
        error: err instanceof ApiError ? err.message : 'Could not save your profile.',
      })
    }
  }

  if (!editing)
    return (
      <section className="profile-card profile-about">
        <h3>A little more you</h3>
        {status.saved && <p className="settings-saved" role="status">✓ Your profile has been saved.</p>}
        <p className="profile-about__label">Display name</p>
        <p>{user.displayName || <span className="settings-muted">Not set · people see @{user.username}</span>}</p>
        <p className="profile-about__label">Bio</p>
        <p>{user.bio || <span className="settings-muted">Tell people what you are learning or building.</span>}</p>
        <p className="profile-about__label">Things I work with</p>
        {user.skills?.length
          ? <div className="skill-list">{user.skills.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}</div>
          : <p className="settings-muted">No skills yet. Add a few so people can find you.</p>}
        <button type="button" className="people-button primary profile-about__edit"
          onClick={() => setEditing(true)}>Edit details</button>
      </section>
    )

  return (
    <section className="profile-card profile-about">
      <h3>A little more you</h3>
      <form onSubmit={handleSubmit} className="profile-about__form">
        <label htmlFor="profile-display-name">Display name</label>
        <input id="profile-display-name" value={displayName} maxLength={50}
          placeholder={user.username} onChange={(event) => setDisplayName(event.target.value)} />

        <label htmlFor="profile-bio">Bio</label>
        <textarea id="profile-bio" rows={4} value={bio} maxLength={MAX_BIO}
          onChange={(event) => setBio(event.target.value)} />
        <p className="profile-about__count">{bio.length}/{MAX_BIO}</p>

        <label htmlFor="profile-skill">Skills ({skills.length}/{MAX_SKILLS})</label>
        <div className="skill-list">
          {skills.map((skill) => (
            <span key={skill} className="skill-tag skill-tag--edit">
              {skill}
              <button type="button" aria-label={`Remove ${skill}`}
                onClick={() => setSkills(skills.filter((item) => item !== skill))}>×</button>
            </span>
          ))}
        </div>
        <div className="profile-about__skill-row">
          <input id="profile-skill" value={skillInput} maxLength={30} placeholder="e.g. React, C++, NestJS"
            onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKey} />
          <button type="button" className="people-button" onClick={addSkill}
            disabled={skills.length >= MAX_SKILLS}>Add skill</button>
        </div>

        {status.error && <p className="form-error" role="alert">{status.error}</p>}
        <div className="profile-about__actions">
          <button type="submit" className="people-button primary" disabled={status.saving}>
            {status.saving ? 'Saving…' : 'Save details'}
          </button>
          <button type="button" className="people-button" onClick={cancel} disabled={status.saving}>Cancel</button>
        </div>
      </form>
    </section>
  )
}

export default ProfileAboutCard
