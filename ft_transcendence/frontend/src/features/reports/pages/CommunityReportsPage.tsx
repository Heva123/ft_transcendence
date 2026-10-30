import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../api/apiClient'
import AppLayout from '../../../components/AppLayout'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { getCommunity } from '../../chat/api/chatApi'
import {
  canModerate,
  getReports,
  reviewReport,
  type CommunityReport,
} from '../api/reportsApi'

type Filter = 'OPEN' | 'REVIEWED'

// Tailwind classes reused on this page (colours and radius come from our design tokens).
const MUTED = 'm-0 text-xs text-muted'
const TAB = 'min-h-10 cursor-pointer rounded-control border border-ink px-3.5 py-2 text-xs'
const BUTTON = 'min-h-10 cursor-pointer rounded-control border border-ink px-3.5 py-2 text-xs disabled:cursor-wait disabled:opacity-60'
const BADGE: Record<string, string> = { OPEN: 'bg-pink', RESOLVED: 'bg-cyan', DISMISSED: 'bg-[#ece6dc]' }
type Action = 'KEEP' | 'REMOVE'

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(iso).toLocaleDateString()
}

const what = (report: CommunityReport) => (report.targetType === 'POST' ? 'post' : 'reply')

function target(report: CommunityReport) {
  if (report.targetType === 'POST')
    return report.post ? { content: report.post.content, author: report.post.author.username, postId: report.post.id } : null
  return report.comment ? { content: report.comment.content, author: report.comment.author.username, postId: report.comment.postId } : null
}

async function loadQueue(communityId: string) {
  const community = await getCommunity(communityId)
  const role = community.members?.[0]?.role ?? 'MEMBER'
  const reports = canModerate(role) ? await getReports(communityId) : []
  return { name: community.name, role, reports }
}

// Moderation queue (design: "Moderation queue" and "Review this report").
function CommunityReportsPage() {
  const { communityId = '' } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<Filter>('OPEN')
  const [openId, setOpenId] = useState('')
  const [action, setAction] = useState<Action>('KEEP')
  const [confirm, setConfirm] = useState<CommunityReport | null>(null)
  const [busy, setBusy] = useState(false)

  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    loadQueue(communityId).then((data) => {
      if (!active) return
      setName(data.name)
      setRole(data.role)
      setReports(data.reports)
      setError('')
      setLoading(false)
    }).catch((err) => {
      if (!active) return
      setError(err instanceof ApiError && err.status === 403
        ? 'Only owners, admins and moderators can see the reports of this community.'
        : 'Could not load the reports. Please try again.')
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [communityId, version])

  const open = reports.filter((r) => r.status === 'OPEN')
  const reviewed = reports.filter((r) => r.status !== 'OPEN')
  const shown = filter === 'OPEN' ? open : reviewed

  function startReview(report: CommunityReport) {
    setOpenId(report.id)
    setAction('KEEP')
    setNotice('')
  }

  async function finish(report: CommunityReport, status: 'RESOLVED' | 'DISMISSED', remove: boolean) {
    setBusy(true)
    setError('')
    try {
      await reviewReport(communityId, report.id, status, remove)
      setNotice(status === 'DISMISSED'
        ? 'Report dismissed. No action was needed.'
        : remove ? `Report resolved. The reported ${what(report)} was removed.` : 'Report resolved.')
      setOpenId('')
      setConfirm(null)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the review.')
      setConfirm(null)
    } finally {
      setBusy(false)
    }
  }

  function resolve(report: CommunityReport) {
    if (action === 'REMOVE') setConfirm(report)
    else void finish(report, 'RESOLVED', false)
  }

  return (
    <AppLayout>
      <button type="button" className="text-link" onClick={() => navigate(`/communities/${communityId}`)}>
        ← Back to Community
      </button>

      <p className="small-label">{name ? `${name} / ` : ''}MODERATION QUEUE</p>
      <h2>Keep this space kind.</h2>

      {loading && <p className={MUTED}>Loading reports…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="rounded-control border border-ink bg-cyan px-4 py-3" role="status">{notice}</p>}

      {!loading && !error && !canModerate(role) && (
        <p className="form-error">Only owners, admins and moderators can see the reports of this community.</p>
      )}

      {!loading && canModerate(role) && (
        <div className="mt-4 grid grid-cols-1 items-start gap-6 min-[851px]:grid-cols-[minmax(0,1fr)_260px]">
          <section aria-label="Reports">
            <div className="mb-3 flex gap-2" role="tablist" aria-label="Report status">
              <button type="button" role="tab" aria-selected={filter === 'OPEN'} className={`${TAB} ${filter === 'OPEN' ? 'bg-plum text-white' : 'bg-white'}`} onClick={() => setFilter('OPEN')}>
                Open ({open.length})
              </button>
              <button type="button" role="tab" aria-selected={filter === 'REVIEWED'} className={`${TAB} ${filter === 'REVIEWED' ? 'bg-plum text-white' : 'bg-white'}`} onClick={() => setFilter('REVIEWED')}>
                Reviewed ({reviewed.length})
              </button>
            </div>

            <p className="my-3 text-xs tracking-wider text-teal">
              {filter === 'OPEN'
                ? `${open.length} OPEN REPORT${open.length === 1 ? '' : 'S'}`
                : `${reviewed.length} REVIEWED`}
            </p>

            {shown.length === 0 && (
              <p className={MUTED}>
                {filter === 'OPEN' ? 'No open reports. Everything is calm here.' : 'No reviewed reports yet.'}
              </p>
            )}

            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {shown.map((report) => {
                const t = target(report)
                return (
                  <li key={report.id} className="report-card flex flex-col gap-3 rounded-panel border border-ink bg-white px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-control px-2.5 py-1 text-[11px] font-bold ${BADGE[report.status]}`}>
                        {report.status === 'OPEN' ? `Reported ${what(report)}` : report.status === 'RESOLVED' ? 'Resolved' : 'Dismissed'}
                      </span>
                      <span className={MUTED}>
                        {report.reason} · reported {timeAgo(report.createdAt)} by @{report.reporter.username}
                      </span>
                    </div>

                    {t ? (
                      <blockquote className="m-0 border-l-4 border-plum bg-background px-4 py-3 wrap-anywhere">
                        “{t.content.length > 280 ? `${t.content.slice(0, 280)}…` : t.content}”
                        <footer className="mt-2 text-xs text-muted">{what(report) === 'post' ? 'Post' : 'Reply'} by @{t.author}</footer>
                      </blockquote>
                    ) : (
                      <p className={MUTED}>The reported {what(report)} was removed.</p>
                    )}

                    {report.status !== 'OPEN' && report.reviewedBy && (
                      <p className={MUTED}>
                        Reviewed by @{report.reviewedBy.username}{report.reviewedAt ? ` · ${timeAgo(report.reviewedAt)}` : ''}
                      </p>
                    )}

                    {report.status === 'OPEN' && openId !== report.id && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" className={`${BUTTON} bg-plum text-white`} onClick={() => startReview(report)}>Review report</button>
                        {t && <Link className="text-link" to={`/posts/${t.postId}`}>View {what(report) === 'post' ? 'post' : 'conversation'}</Link>}
                      </div>
                    )}

                    {report.status === 'OPEN' && openId === report.id && (
                      <div className="flex flex-col gap-2 border-t border-ink/20 pt-3">
                        <label htmlFor={`action-${report.id}`} className="text-xs font-bold">Action</label>
                        <select id={`action-${report.id}`} value={action} onChange={(e) => setAction(e.target.value as Action)} disabled={busy}
                          className="min-h-10 max-w-[320px] rounded-control border border-ink bg-white px-2.5 py-2 text-xs">
                          <option value="KEEP">Keep the {what(report)}</option>
                          {t && <option value="REMOVE">Remove the reported {what(report)}</option>}
                        </select>
                        <div className="flex flex-wrap items-center gap-3">
                          <button type="button" className={`${BUTTON} bg-plum text-white`} disabled={busy} onClick={() => resolve(report)}>Resolve report</button>
                          <button type="button" className={`${BUTTON} bg-white text-plum`} disabled={busy} onClick={() => void finish(report, 'DISMISSED', false)}>Dismiss report</button>
                          <button type="button" className="text-link" disabled={busy} onClick={() => setOpenId('')}>Back to queue</button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <aside className="rounded-panel border border-ink bg-yellow p-4 text-xs [&_p]:mt-2 [&_p]:mb-0">
            <strong>Keep decisions clear and fair.</strong>
            <p>Review context before removing content. Moderators can act on reports within their own community.</p>
            <p><b>Resolve</b>: the report was right. You can keep or remove the content.</p>
            <p><b>Dismiss</b>: no rule was broken. Nothing changes.</p>
            <p>The reporter gets a notification either way.</p>
          </aside>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={`Remove this ${what(confirm)}?`}
          message={`The ${what(confirm)} and its replies are deleted for everyone. The author and the reporter get a notification. This cannot be undone.`}
          confirmLabel={`Remove ${what(confirm)}`}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={() => void finish(confirm, 'RESOLVED', true)}
        />
      )}
    </AppLayout>
  )
}

export default CommunityReportsPage
