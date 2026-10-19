import { useEffect, useState } from 'react'
import { socket } from '../../../api/socket'

export type SocketStatus = 'idle' | 'connected' | 'reconnecting'

export function useSocketStatus() {
  const [status, setStatus] = useState<SocketStatus>('idle')

  useEffect(() => {
    function handleConnect() {
      setStatus('connected')
    }

    function handleDisconnect() {
      setStatus('reconnecting')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.io.on('reconnect_attempt', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.io.off('reconnect_attempt', handleDisconnect)
    }
  }, [])

  return status
}
