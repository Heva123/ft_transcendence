import { socket } from '../../../api/socket'
import type { SocketStatus } from '../hooks/useSocketStatus'

type ConnectionStatusProps = {
  status: SocketStatus
}

function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status !== 'reconnecting')
    return null

  return (
    <div className="connection-status">
      <p className="m-0 text-[11px]">Connection lost. Your draft is kept. Reconnecting…</p>
      <button type="button" className="border border-ink bg-surface px-4 py-2 text-[11px]"
        onClick={() => socket.connect()}>
        Retry connection
      </button>
    </div>
  )
}

export default ConnectionStatus
