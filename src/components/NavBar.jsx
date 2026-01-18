import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStoredJwt, decodeJwtPayload, clearStoredJwt } from '../lib/api'

export default function NavBar() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const check = () => {
      const token = getStoredJwt()
      const payload = token ? decodeJwtPayload(token) : null
      setIsAdmin(Boolean(payload?.role === 'admin'))
    }
    check()
    window.addEventListener('storage', check)
    return () => window.removeEventListener('storage', check)
  }, [])

  return (
    <nav className="nav-bar" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
      <Link to="/">Home</Link>
      <Link to="/admin">Admin</Link>
      {isAdmin ? (
        <button
          type="button"
          onClick={() => {
            clearStoredJwt()
            // force a reload to update UI/state
            window.location.href = '/'
          }}
        >
          Logout
        </button>
      ) : null}
    </nav>
  )
}
