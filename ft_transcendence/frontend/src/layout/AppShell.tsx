import { useEffect, type ReactNode } from 'react'
import {
  connectSocket,
  disconnectSocket,
} from '../api/socket'
import NotificationToasts from '../features/notifications/components/NotificationToasts'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './layout.css'

type AppShellProps = {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token)
      connectSocket(token)

    return disconnectSocket
  }, [])

  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-shell__body">
        <Sidebar />
        <main className="app-shell__main">
          {children}
        </main>
      </div>
      <NotificationToasts />
    </div>
  )
}

export default AppShell
