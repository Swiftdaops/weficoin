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
    <div style={{ marginTop: 16 }}>
      <h2>Connections</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : wallets.length === 0 ? (
        <div>No connections found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 6 }}>Wallet</th>
              <th style={{ textAlign: 'left', padding: 6 }}>ETH Balance</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Chain</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Connected At</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w._id}>
                <td style={{ padding: 6 }}>{w.walletAddress}</td>
                <td style={{ padding: 6 }}>{w.ethBalance ?? '—'}</td>
                <td style={{ padding: 6 }}>{w.chainId}</td>
                <td style={{ padding: 6 }}>{new Date(w.connectedAt).toLocaleString()}</td>
                <td style={{ padding: 6 }}>{new Date(w.lastSeenAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
