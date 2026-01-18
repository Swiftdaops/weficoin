import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { decodeJwtPayload, getStoredJwt } from './lib/api'
import AdminDashboard from './components/AdminDashboard'
import AdminConnections from './components/AdminConnections'
import BackendLiveIndicator from './components/BackendLiveIndicator'
import ClaimWefi from './components/ClaimWefi'
import NavBar from './components/NavBar'

function Home() {
  return (
    <>
      <ClaimWefi />
    </>
  )
}

function Layout({ children }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <>
      {!isHome ? <NavBar /> : null}
      {!isHome ? <BackendLiveIndicator /> : null}
      {children}
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
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/connections" element={<AdminConnections />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
