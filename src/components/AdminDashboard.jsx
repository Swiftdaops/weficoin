import { decodeJwtPayload, getStoredJwt } from '../lib/api'

export default function AdminDashboard() {
  const token = getStoredJwt()
  const payload = token ? decodeJwtPayload(token) : null

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
      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={() => (window.location.hash = '')}>
          Back to app
        </button>
      </div>
    </div>
  )
}
