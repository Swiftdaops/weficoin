import { useEffect, useState } from 'react'
import { deleteAdminWallets, getAdminWallets } from '../lib/api'

export default function AdminConnections() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState([])
  const [clearing, setClearing] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminWallets()
      setWallets(data?.wallets || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    refresh()

    return () => {
      mounted = false
    }
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
