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
    } catch {
      setAdminError('Invalid credentials or server error')
    }
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Admin Dashboard</h2>
            <div className="mt-1 text-sm text-slate-600">
              Status: <span className="font-medium text-slate-900">{payload?.role === 'admin' ? 'Authenticated' : 'Not authenticated'}</span>
            </div>
            {payload?.email ? (
              <div className="mt-1 text-sm text-slate-600">
                Email: <span className="font-medium text-slate-900">{payload.email}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Back to app
            </button>
            {payload?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => navigate('/admin/connections')}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                View Connections
              </button>
            ) : null}
          </div>
        </div>

        {payload?.role !== 'admin' ? (
          <form onSubmit={onAdminSubmit} className="mt-5 grid gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin email</label>
              <input
                type="email"
                placeholder="web3@gmail.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Sign in
              </button>
              {adminStatus ? <div className="text-sm text-slate-700">{adminStatus}</div> : null}
              {adminError ? <div className="text-sm text-red-600">{adminError}</div> : null}
            </div>
          </form>
        ) : null}

      </div>
    </div>
  )
}
