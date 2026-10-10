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
      <p>Connection lost. Your draft is kept. Reconnecting…</p>
      <button type="button" onClick={() => socket.connect()}>
        Retry connection
      </button>
    </div>
  )
}

export default ConnectionStatus
