import { useState } from 'react'
import { decodeJwtPayload, getStoredJwt, postAdminLogin, setStoredJwt } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => getStoredJwt())
  const payload = token ? decodeJwtPayload(token) : null

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
        setToken(res.token)
        setAdminStatus('Admin logged in')
        return
      }
      setAdminError('Login failed')
    } catch (err) {
      setAdminError('Invalid credentials or server error')
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginTop: 8 }}>
        <strong>Status:</strong> {payload?.role === 'admin' ? 'Authenticated' : 'Not authenticated'}
      </div>
      {payload?.email ? (
        <div>
          <strong>Email:</strong> {payload.email}
        </div>
      ) : null}

      {payload?.role !== 'admin' ? (
        <form className="admin-login" onSubmit={onAdminSubmit} style={{ marginTop: 12 }}>
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

      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => navigate('/')}>Back to app</button>
        {payload?.role === 'admin' ? (
          <button type="button" onClick={() => navigate('/admin/connections')}>View Connections</button>
        ) : null}
      </div>
    </div>
  )
}
