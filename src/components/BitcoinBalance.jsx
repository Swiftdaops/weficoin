import { useEffect, useState } from 'react'
import { getBtcBalance } from '../lib/api'

function looksLikeBtcAddress(address) {
  const value = String(address || '').trim()
  if (!value) return false
  return value.startsWith('1') || value.startsWith('3') || value.toLowerCase().startsWith('bc1')
}

const STORAGE_KEY = 'btcAddress'

export default function BitcoinBalance() {
  const [btcAddress, setBtcAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setBtcAddress(saved)
  }, [])

  async function onGetBalance() {
    const addr = String(btcAddress || '').trim()
    setError('')
    setResult(null)

    if (!looksLikeBtcAddress(addr)) {
      setError('Enter a valid BTC address (bc1… / 1… / 3…)')
      return
    }

    localStorage.setItem(STORAGE_KEY, addr)

    setLoading(true)
    try {
      const data = await getBtcBalance(addr)
      setResult(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load BTC balance (backend not deployed yet?)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="text-sm font-semibold text-slate-100">Step 3: Bitcoin Address (Optional)</div>

      <label className="mb-2 mt-3 block text-sm font-medium text-slate-200">BTC address</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={btcAddress}
          onChange={(e) => setBtcAddress(e.target.value)}
          placeholder="bc1..."
          className="w-full flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          type="button"
          onClick={onGetBalance}
          disabled={loading}
          className={
            'rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 ' +
            (loading ? 'opacity-60 cursor-not-allowed' : '')
          }
        >
          {loading ? 'Checking…' : 'Get BTC Balance'}
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
          <p className="text-slate-200">
            Confirmed: <span className="font-semibold text-white">{result.confirmedBtc}</span> BTC
          </p>
          <p className="mt-1 text-slate-200">
            Total (incl. mempool): <span className="font-semibold text-white">{result.totalBtc}</span> BTC
          </p>
        </div>
      ) : null}
    </div>
  )
}
