import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { clearStoredJwt, decodeJwtPayload, deleteAdminWallets, getAdminWallets, getBtcBalance, getStoredJwt } from '../lib/api'

function looksLikeBtcAddress(address) {
  const value = String(address || '').trim()
  return value.startsWith('1') || value.startsWith('3') || value.toLowerCase().startsWith('bc1')
}

export default function AdminConnections() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState([])
  const [btcBalances, setBtcBalances] = useState({})
  const [btcLoading, setBtcLoading] = useState({})
  const [clearing, setClearing] = useState(false)

  async function onGetBtcBalance(address) {
    const addr = String(address || '').trim()
    if (!looksLikeBtcAddress(addr)) return
    if (btcLoading[addr]) return

    setBtcLoading((prev) => ({ ...prev, [addr]: true }))
    try {
      const res = await getBtcBalance(addr)
      setBtcBalances((prev) => ({ ...prev, [addr]: res?.totalBtc }))
    } catch (err) {
      console.error(err)
      setBtcBalances((prev) => ({ ...prev, [addr]: null }))
    } finally {
      setBtcLoading((prev) => ({ ...prev, [addr]: false }))
    }
  }

  async function refresh() {
    const token = getStoredJwt()
    const payload = token ? decodeJwtPayload(token) : null
    if (payload?.role !== 'admin') {
      setLoading(false)
      setWallets([])
      setError('Unauthorized. Please sign in as admin.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await getAdminWallets()
      const nextWallets = data?.wallets || []
      setWallets(nextWallets)
    } catch (err) {
      console.error(err)
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        clearStoredJwt()
        setError('Session expired. Please sign in again.')
        setWallets([])
        return
      }
      setError('Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = getStoredJwt()
    const payload = token ? decodeJwtPayload(token) : null
    if (payload?.role !== 'admin') {
      setLoading(false)
      setError('Unauthorized. Redirecting to admin login...')
      setWallets([])
      navigate('/admin', { replace: true })
      return
    }

    refresh()

    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/$/, '')
    const socket = io(`${base}/admin`, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      auth: { token },
    })

    const onSession = () => {
      refresh()
    }

    socket.on('session', onSession)

    return () => {
      socket.off('session', onSession)
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onClearAll() {
    if (clearing) return
    const ok = window.confirm('Delete ALL connections?')
    if (!ok) return

    setClearing(true)
    setError('')
    try {
      await deleteAdminWallets()
      await refresh()
    } catch (err) {
      console.error(err)
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        clearStoredJwt()
        setError('Session expired. Please sign in again.')
        setWallets([])
        navigate('/admin', { replace: true })
        return
      }
      setError('Failed to clear connections')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-5xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Connections</h2>
          <button
            type="button"
            onClick={onClearAll}
            disabled={clearing}
            className={
              'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 ' +
              (clearing ? 'opacity-50 cursor-not-allowed' : '')
            }
          >
            {clearing ? 'Clearing…' : 'Clear all'}
          </button>
        </div>
      {loading ? (
        <div className="mt-4 text-sm text-slate-600">Loading...</div>
      ) : error ? (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      ) : wallets.length === 0 ? (
        <div className="mt-4 text-sm text-slate-600">No connections found.</div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-3 py-2">Wallet</th>
                <th className="px-3 py-2">ETH Balance</th>
                <th className="px-3 py-2">BTC Balance</th>
                <th className="px-3 py-2">Chain</th>
                <th className="px-3 py-2">Connected At</th>
                <th className="px-3 py-2">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wallets.map((w) => (
                <tr key={w._id} className="text-sm text-slate-900">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-800">
                    {w.walletAddress}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{w.ethBalance ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {looksLikeBtcAddress(w.walletAddress) ? (
                      btcLoading[w.walletAddress] ? (
                        '…'
                      ) : typeof btcBalances[w.walletAddress] === 'number' ? (
                        btcBalances[w.walletAddress]
                      ) : btcBalances[w.walletAddress] === null ? (
                        '—'
                      ) : (
                        <button
                          type="button"
                          onClick={() => onGetBtcBalance(w.walletAddress)}
                          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Get BTC
                        </button>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{w.chainId}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {new Date(w.connectedAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {new Date(w.lastSeenAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}
