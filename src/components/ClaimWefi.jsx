import { useEffect, useMemo, useState } from 'react'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import BitcoinBalance from './BitcoinBalance'

const BONUS_MAP = {
  less_3: 0.05,
  '3_6': 0.1,
  '6_12': 0.2,
  '1_plus': 0.35,
}

export default function ClaimWefi() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const walletConnectProjectId = (import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '').trim()

  const [btcPrice, setBtcPrice] = useState(null)
  const [duration, setDuration] = useState('')
  const baseReward = 1

  useEffect(() => {
    let mounted = true

    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        const usd = data?.bitcoin?.usd
        if (mounted && typeof usd === 'number') setBtcPrice(usd)
      })
      .catch(() => {
        if (mounted) setBtcPrice(null)
      })

    return () => {
      mounted = false
    }
  }, [])

  const bonusRate = duration ? BONUS_MAP[duration] || 0 : 0
  const bonusAmount = baseReward * bonusRate
  const totalReward = baseReward + bonusAmount
  const showConnectStep = Boolean(duration) || isConnected

  const priceLabel = useMemo(() => {
    if (!btcPrice) return 'Fetching BTC price...'
    return `BTC Price: $${btcPrice.toLocaleString()}`
  }, [btcPrice])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center text-2xl font-semibold">Claim Your WEFICoin Reward</h1>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="text-sm font-semibold text-slate-100">Step 1: Select Investor Duration</div>

              <label className="mb-2 mt-3 block text-sm font-medium text-slate-200">
                How long have you been an investor with us?
              </label>

              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Select duration</option>
                <option value="less_3">Less than 3 months</option>
                <option value="3_6">3 – 6 months</option>
                <option value="6_12">6 – 12 months</option>
                <option value="1_plus">1+ year</option>
              </select>

              {!duration ? (
                <div className="mt-3 text-sm text-slate-300">
                  Complete Step 1 to unlock wallet connection.
                </div>
              ) : null}

              {duration ? (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm">
                  <p className="text-slate-200">
                    Base Reward: <span className="font-semibold text-white">1.00 BTC (WEFI)</span>
                  </p>
                  <p className="mt-1 text-slate-200">
                    Loyalty Bonus: <span className="font-semibold text-white">{(bonusRate * 100).toFixed(0)}%</span>
                  </p>
                  <p className="mt-3 text-base font-semibold text-emerald-300">
                    Total Claimable: <span className="text-white">{totalReward.toFixed(2)} BTC (WEFI)</span>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="text-sm font-semibold text-slate-100">Step 2: Connect Wallet</div>
              {showConnectStep ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ConnectButton />
                    {!isConnected && walletConnectProjectId && openConnectModal ? (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Show QR Code
                      </button>
                    ) : null}
                  </div>
                  {!isConnected ? (
                    <div className="mt-3 text-sm text-slate-300">Connect your wallet to enable claiming.</div>
                  ) : null}
                </>
              ) : (
                <div className="mt-3 text-sm text-slate-300">Wallet connection unlocks after Step 1.</div>
              )}

            </div>

            <BitcoinBalance />

            <div className="mt-6 text-center text-sm font-medium text-emerald-300">{priceLabel}</div>

            <button
              type="button"
              disabled={!isConnected || !duration}
              onClick={() => alert('Claim flow not wired')}
              className={
                'mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold tracking-wide text-slate-900 ' +
                'bg-gradient-to-r from-amber-300 to-yellow-500 ' +
                (isConnected && duration
                  ? 'hover:from-amber-200 hover:to-yellow-400'
                  : 'opacity-50 cursor-not-allowed')
              }
            >
              CLAIM NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
