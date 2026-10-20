import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryOf } from '../features/notifications/notificationTypes'
import { useNotifications } from '../features/notifications/hooks/useNotifications'
import type { Notification } from '../features/notifications/types/Notification'
import './NotificationsPage.css'

type RowProps = {
  item: Notification
  onRead: (id: string) => void
}

function NotificationRow({ item, onRead }: RowProps) {
  const category = categoryOf(item.type)
  const badgeClass = `notification-badge ${category.className} ${item.read ? 'read' : 'unread'}`

  return (
    <article className={item.read ? 'notification-row' : 'notification-row is-unread'}>
      <div className={badgeClass} title={item.type}>{category.label}</div>
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const unreadCount = notifications.filter((item) => !item.read).length
  const shown = filter === 'unread'
    ? notifications.filter((item) => !item.read)
    : notifications

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
        <div className="notifications-filter" role="group" aria-label="Show">
          <button type="button" aria-pressed={filter === 'all'}
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}>All</button>
          <button type="button" aria-pressed={filter === 'unread'}
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}>Unread</button>
        </div>
      </div>

      {error && <p className="notifications-error" role="alert">{error}</p>}

      <div className="notifications-panel">
        {loading && <p className="notifications-empty">Loading your updates…</p>}
        {!loading && !shown.length && (
          <p className="notifications-empty">
            {filter === 'unread'
              ? 'No unread updates. You’re all caught up.'
              : 'Nothing yet. Updates about your posts and communities will appear here.'}
          </p>
        )}
        {shown.map((item) => (
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
