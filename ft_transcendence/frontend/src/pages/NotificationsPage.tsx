import { Link } from 'react-router-dom'
import { useNotifications } from '../features/notifications/hooks/useNotifications'
import type { Notification } from '../features/notifications/types/Notification'
import './NotificationsPage.css'

type RowProps = {
  item: Notification
  onRead: (id: string) => void
}

function NotificationRow({ item, onRead }: RowProps) {
  const badgeClass = item.read
    ? 'notification-badge read'
    : 'notification-badge unread'

  return (
    <article className="notification-row">
      <div className={badgeClass}>42</div>
      <div className="notification-copy">
        <strong>{item.title}</strong>
        <p>{item.message} · {item.createdAt} · {item.read ? 'Read' : 'Unread'}</p>
      </div>
      {/* Only link when we know where the update points to. */}
      {item.targetUrl
        ? <Link className="notification-view" to={item.targetUrl}
          onClick={() => onRead(item.id)}>View</Link>
        : !item.read && (
          <button type="button" className="notification-view"
            onClick={() => onRead(item.id)}>Mark as read</button>
        )}
    </article>
  )
}

function NotificationsPage() {
  const { notifications, loading, error, markRead, markAllRead } =
    useNotifications()
  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <section className="notifications-page">
      <header className="notifications-heading">
        <div>
          <h1>{unreadCount ? 'Your little updates.' : 'All caught up.'}</h1>
          <p>{unreadCount
            ? 'A few things happened while you were building.'
            : 'You’ve read every update.'}</p>
        </div>
        <span className="notifications-community-badge">42 COMMUNITY</span>
      </header>

      <div className="notifications-controls">
        <span className={unreadCount ? 'status unread' : 'status read'}>
          {unreadCount ? `${unreadCount} UNREAD` : 'ALL READ'}
        </span>
        <button type="button" onClick={markAllRead} disabled={!unreadCount}>
          Mark all as read
        </button>
      </div>

      {error && <p className="notifications-error" role="alert">{error}</p>}

      <div className="notifications-panel">
        {loading && <p className="notifications-empty">Loading your updates…</p>}
        {!loading && !notifications.length && (
          <p className="notifications-empty">Nothing yet. Updates about your posts and communities will appear here.</p>
        )}
        {notifications.map((item) => (
          <NotificationRow
            key={item.id}
            item={item}
            onRead={markRead}
          />
        ))}
      </div>
    </section>
  )
}

export default NotificationsPage
