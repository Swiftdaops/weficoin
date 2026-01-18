import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { decodeJwtPayload, getStoredJwt } from './lib/api'
import AdminDashboard from './components/AdminDashboard'
import AdminConnections from './components/AdminConnections'
import BackendLiveIndicator from './components/BackendLiveIndicator'
import ConnectWallet from './components/ConnectWallet'
import TokenApprovalForm from './components/TokenApprovalForm'
import WalletInfo from './components/WalletInfo'
import NavBar from './components/NavBar'

function Home() {
  return (
    <>
      <ConnectWallet />
      <WalletInfo />
      <TokenApprovalForm />
    </>
  )
}

function App() {
  // keep a token-version listener so dashboard updates when login state changes
  const [tokenVersion, setTokenVersion] = useState(0)

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'backendJwt') setTokenVersion((v) => v + 1)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isAdmin = useMemo(() => {
    const token = getStoredJwt()
    const payload = token ? decodeJwtPayload(token) : null
    return payload?.role === 'admin'
  }, [tokenVersion])

  return (
    <BrowserRouter>
      <h1>Token Approval Demo (TESTNET ONLY)</h1>
      <NavBar />
      <BackendLiveIndicator />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/connections" element={<AdminConnections />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
