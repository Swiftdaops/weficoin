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
  const dotClass =
    status === 'connecting'
      ? 'bg-amber-400'
      : isLive
        ? 'bg-emerald-400'
        : 'bg-rose-400'

  return (
    <div
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className="text-slate-600">Backend</span>
      <span className="font-medium text-slate-900">{label}</span>
    </div>
  )
}
