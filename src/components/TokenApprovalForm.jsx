import { useMemo, useState } from 'react'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { postEvent } from '../lib/api'
import ApprovalStatus from './ApprovalStatus'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function envAddress(key) {
  const value = String(import.meta.env[key] || '').trim()
  if (!value) return undefined
  if (!isAddress(value)) return undefined
  return value
}

export default function TokenApprovalForm() {
  const { isConnected, address } = useAccount()

  const token = useMemo(() => envAddress('VITE_TOKEN_ADDRESS'), [])
  const spender = useMemo(() => envAddress('VITE_SPENDER_ADDRESS'), [])

  const [amount, setAmount] = useState('')
  const [lastTxHash, setLastTxHash] = useState()
  const [error, setError] = useState()

  const canRun = Boolean(token && spender && isConnected)

  const { symbol, formattedBalance, approveExact, approveUnlimited, refetchAllowance } =
    useTokenApproval({
      token: token ?? ZERO_ADDRESS,
      spender: spender ?? ZERO_ADDRESS,
    })

  if (!isConnected) return null

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Token Approval</h2>

      <div style={{ marginTop: 8 }}>
        <div>
          <strong>Token:</strong> {token ?? 'Missing/invalid VITE_TOKEN_ADDRESS'}
        </div>
        <div>
          <strong>Spender:</strong> {spender ?? 'Missing/invalid VITE_SPENDER_ADDRESS'}
        </div>
        <div style={{ marginTop: 6 }}>
          <strong>Token balance:</strong> {formattedBalance ?? '…'} {symbol ?? ''}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Amount ({symbol ?? 'token'}):
          <input
            style={{ marginLeft: 8 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1.5"
          />
        </label>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          disabled={!canRun}
          onClick={async () => {
            setError(undefined)
            try {
              if (address) {
                await postEvent({
                  walletAddress: address,
                  eventType: 'CLICK_APPROVE_EXACT',
                  metadata: { token, spender, amount },
                })
              }
              const hash = await approveExact(amount)
              setLastTxHash(hash)
              await refetchAllowance()
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            }
          }}
        >
          Approve Exact
        </button>

        <button
          disabled={!canRun}
          onClick={async () => {
            setError(undefined)
            try {
              if (address) {
                await postEvent({
                  walletAddress: address,
                  eventType: 'CLICK_APPROVE_UNLIMITED',
                  metadata: { token, spender },
                })
              }
              const hash = await approveUnlimited()
              setLastTxHash(hash)
              await refetchAllowance()
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e))
            }
          }}
        >
          Approve Unlimited (MaxUint256)
        </button>
      </div>

      {error ? (
        <div style={{ marginTop: 10, color: 'crimson' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      {lastTxHash ? (
        <div style={{ marginTop: 10 }}>
          <strong>Last tx:</strong> {lastTxHash}
        </div>
      ) : null}

      {token && spender ? (
        <ApprovalStatus
          token={token}
          spender={spender}
          onRevoke={(hash) => setLastTxHash(hash)}
        />
      ) : null}

      {!token || !spender ? (
        <div style={{ marginTop: 12 }}>
          Add valid addresses to your env:
          <ul>
            <li>VITE_TOKEN_ADDRESS</li>
            <li>VITE_SPENDER_ADDRESS</li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
