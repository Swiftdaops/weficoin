import { useAccount } from 'wagmi'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { postEvent } from '../lib/api'

export default function ApprovalStatus({ token, spender, onRevoke }) {
  const { isConnected, address } = useAccount()
  const { symbol, formattedAllowance, revoke, refetchAllowance } = useTokenApproval({
    token,
    spender,
  })

  if (!isConnected) return null

  return (
    <div style={{ marginTop: 16 }}>
      <div>
        <strong>Allowance:</strong>{' '}
        {formattedAllowance !== undefined ? formattedAllowance : '…'} {symbol ?? ''}
      </div>
      <button
        style={{ marginTop: 8 }}
        onClick={async () => {
          if (address) {
            try {
              await postEvent({
                walletAddress: address,
                eventType: 'REVOKE',
                metadata: { token, spender },
              })
            } catch {
              // ignore if backend offline
            }
          }
          const hash = await revoke()
          onRevoke?.(hash)
          await refetchAllowance()
        }}
      >
        Revoke (approve 0)
      </button>
    </div>
  )
}
