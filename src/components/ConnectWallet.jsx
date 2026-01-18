import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { postAdminLogin, setStoredJwt } from '../lib/api'

export default function ConnectWallet() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const walletConnectProjectId = (import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '').trim()

  const [showAdmin, setShowAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminStatus, setAdminStatus] = useState('')
  const [adminError, setAdminError] = useState('')

  async function onAdminSubmit(e) {
    e.preventDefault()
    setAdminError('')
    setAdminStatus('')

    try {
      const res = await postAdminLogin({ email: adminEmail, password: adminPassword })
      if (res?.token) {
        setStoredJwt(res.token)
        setAdminStatus('Admin logged in')
        window.location.hash = 'admin'
        return
      }
      setAdminError('Login failed')
    } catch {
      setAdminError('Invalid credentials or server error')
    }
  }

  return (
    <div>
      <div className="connect-row">
        <ConnectButton />
        <button type="button" className="connect-link" onClick={() => setShowAdmin((v) => !v)}>
          Admin Login
        </button>
        {!isConnected && walletConnectProjectId && openConnectModal ? (
          <button type="button" onClick={openConnectModal}>
            Show QR Code
          </button>
        ) : null}
        {!isConnected && walletConnectProjectId ? (
          <div className="connect-help">Scan the QR with your phone wallet (WalletConnect).</div>
        ) : null}
      </div>

      {showAdmin ? (
        <form className="admin-login" onSubmit={onAdminSubmit}>
          <input
            type="email"
            placeholder="Admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <button type="submit">Sign in</button>
          {adminStatus ? <div className="admin-login__status">{adminStatus}</div> : null}
          {adminError ? <div className="admin-login__error">{adminError}</div> : null}
        </form>
      ) : null}
    </div>
  )
}
