import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './layout.css'

type AppShellProps = {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-shell__body">
        <Sidebar />

        <main className="app-shell__main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell