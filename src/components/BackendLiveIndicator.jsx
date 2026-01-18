import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export default function BackendLiveIndicator() {
  const socketUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/$/, '')
    return base
  }, [])

  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
    })

    const onConnect = () => setStatus('connected')
    const onDisconnect = () => setStatus('disconnected')
    const onConnectError = () => setStatus('disconnected')

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.disconnect()
    }
  }, [socketUrl])

  const isLive = status === 'connected'
  const label = status === 'connecting' ? 'Connecting…' : isLive ? 'Live' : 'Offline'

  return (
    <div className="backend-indicator" aria-live="polite">
      <span className="backend-indicator__dot" data-live={isLive ? '1' : '0'} />
      <span className="backend-indicator__text">Backend: {label}</span>
    </div>
  )
}
