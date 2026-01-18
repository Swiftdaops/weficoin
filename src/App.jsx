import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import AdminConnections from './components/AdminConnections'
import BackendLiveIndicator from './components/BackendLiveIndicator'
import ClaimWefi from './components/ClaimWefi'
import NavBar from './components/NavBar'
import SessionRecorder from './components/SessionRecorder'

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
      <SessionRecorder />
      {!isHome ? <NavBar /> : null}
      {!isHome ? <BackendLiveIndicator /> : null}
      {children}
    </>
  )
}

function App() {
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
