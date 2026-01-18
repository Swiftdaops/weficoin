import { useEffect, useState } from 'react'
import { getAdminWallets } from '../lib/api'

export default function AdminConnections() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wallets, setWallets] = useState([])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    getAdminWallets()
      .then((data) => {
        if (!mounted) return
        // endpoint returns { ok: true, wallets: [...] }
        setWallets(data?.wallets || [])
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load connections')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="mx-auto mt-6 w-full max-w-5xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Connections</h2>
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
