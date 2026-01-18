import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { decodeJwtPayload, getStoredJwt } from './lib/api'
import AdminDashboard from './components/AdminDashboard'
import BackendLiveIndicator from './components/BackendLiveIndicator'
import ConnectWallet from './components/ConnectWallet'
import TokenApprovalForm from './components/TokenApprovalForm'
import WalletInfo from './components/WalletInfo'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [tokenVersion, setTokenVersion] = useState(0)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    const onStorage = (e) => {
      if (e.key === 'backendJwt') setTokenVersion((v) => v + 1)
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const isAdmin = useMemo(() => {
    const token = getStoredJwt()
    const payload = token ? decodeJwtPayload(token) : null
    return payload?.role === 'admin'
  }, [tokenVersion])

  const route = hash.replace(/^#/, '')

  return (
    <>
      <h1>Token Approval Demo (TESTNET ONLY)</h1>
      <BackendLiveIndicator />
      <ConnectWallet />
      {route === 'admin' ? (
        isAdmin ? (
          <AdminDashboard />
        ) : (
          <div style={{ marginTop: 16 }}>
            <h2>Admin Dashboard</h2>
            <div>Please sign in with admin email/password.</div>
          </div>
        )
      ) : (
        <>
          <WalletInfo />
          <TokenApprovalForm />
        </>
      )}
    </>
  )
}

export default App
