import { Link } from 'react-router-dom'
import { mockNotifications } from '../features/notifications/data/mockNotifications'
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
        <p>{item.message} · {item.createdAt}</p>
      </div>
      <Link
        className="notification-view"
        to={item.targetUrl ?? '/'}
        onClick={() => onRead(item.id)}
      >
        View
      </Link>
    </article>
  )
}

function NotificationsPage() {
  const { notifications, markRead, markAllRead } =
    useNotifications(mockNotifications)
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
        <button type="button" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="notifications-panel">
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
