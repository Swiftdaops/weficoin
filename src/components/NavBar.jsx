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
    <nav className="mb-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Link className="text-sm font-medium text-slate-700 hover:text-slate-900" to="/">
        Home
      </Link>
      <Link className="text-sm font-medium text-slate-700 hover:text-slate-900" to="/admin">
        Admin
      </Link>
      {isAdmin ? (
        <button
          type="button"
          onClick={() => {
            clearStoredJwt()
            // force a reload to update UI/state
            window.location.href = '/'
          }}
          className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Logout
        </button>
      ) : null}
    </nav>
  )
}
