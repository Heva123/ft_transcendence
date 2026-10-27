import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/apiClient'
import AppLayout from '../components/AppLayout'
import ConfirmDialog from '../components/ConfirmDialog'
import { getCommunity } from '../features/chat/api/chatApi'
import {
  canModerate,
  getReports,
  reviewReport,
  type CommunityReport,
} from '../features/reports/api/reportsApi'
import './CommunityReportsPage.css'

type Filter = 'OPEN' | 'REVIEWED'
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

      {loading && <p className="reports-muted">Loading reports…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="reports-notice" role="status">{notice}</p>}

      {!loading && !error && !canModerate(role) && (
        <p className="form-error">Only owners, admins and moderators can see the reports of this community.</p>
      )}

      {!loading && canModerate(role) && (
        <div className="reports-layout">
          <section className="reports-main" aria-label="Reports">
            <div className="reports-filter" role="tablist" aria-label="Report status">
              <button type="button" role="tab" aria-selected={filter === 'OPEN'} className={filter === 'OPEN' ? 'active' : ''} onClick={() => setFilter('OPEN')}>
                Open ({open.length})
              </button>
              <button type="button" role="tab" aria-selected={filter === 'REVIEWED'} className={filter === 'REVIEWED' ? 'active' : ''} onClick={() => setFilter('REVIEWED')}>
                Reviewed ({reviewed.length})
              </button>
            </div>

            <p className="reports-count">
              {filter === 'OPEN'
                ? `${open.length} OPEN REPORT${open.length === 1 ? '' : 'S'}`
                : `${reviewed.length} REVIEWED`}
            </p>

            {shown.length === 0 && (
              <p className="reports-muted">
                {filter === 'OPEN' ? 'No open reports. Everything is calm here.' : 'No reviewed reports yet.'}
              </p>
            )}

            <ul className="reports-list">
              {shown.map((report) => {
                const t = target(report)
                return (
                  <li key={report.id} className="report-card">
                    <div className="report-card__head">
                      <span className={`report-badge ${report.status.toLowerCase()}`}>
                        {report.status === 'OPEN' ? `Reported ${what(report)}` : report.status === 'RESOLVED' ? 'Resolved' : 'Dismissed'}
                      </span>
                      <span className="reports-muted">
                        {report.reason} · reported {timeAgo(report.createdAt)} by @{report.reporter.username}
                      </span>
                    </div>

                    {t ? (
                      <blockquote className="report-quote">
                        “{t.content.length > 280 ? `${t.content.slice(0, 280)}…` : t.content}”
                        <footer>{what(report) === 'post' ? 'Post' : 'Reply'} by @{t.author}</footer>
                      </blockquote>
                    ) : (
                      <p className="reports-muted">The reported {what(report)} was removed.</p>
                    )}

                    {report.status !== 'OPEN' && report.reviewedBy && (
                      <p className="reports-muted">
                        Reviewed by @{report.reviewedBy.username}{report.reviewedAt ? ` · ${timeAgo(report.reviewedAt)}` : ''}
                      </p>
                    )}

                    {report.status === 'OPEN' && openId !== report.id && (
                      <div className="report-actions">
                        <button type="button" className="report-primary" onClick={() => startReview(report)}>Review report</button>
                        {t && <Link className="text-link" to={`/posts/${t.postId}`}>View {what(report) === 'post' ? 'post' : 'conversation'}</Link>}
                      </div>
                    )}

                    {report.status === 'OPEN' && openId === report.id && (
                      <div className="report-review">
                        <label htmlFor={`action-${report.id}`}>Action</label>
                        <select id={`action-${report.id}`} value={action} onChange={(e) => setAction(e.target.value as Action)} disabled={busy}>
                          <option value="KEEP">Keep the {what(report)}</option>
                          {t && <option value="REMOVE">Remove the reported {what(report)}</option>}
                        </select>
                        <div className="report-actions">
                          <button type="button" className="report-primary" disabled={busy} onClick={() => resolve(report)}>Resolve report</button>
                          <button type="button" className="report-secondary" disabled={busy} onClick={() => void finish(report, 'DISMISSED', false)}>Dismiss report</button>
                          <button type="button" className="text-link" disabled={busy} onClick={() => setOpenId('')}>Back to queue</button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <aside className="reports-aside">
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
