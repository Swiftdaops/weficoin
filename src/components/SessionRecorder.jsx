import { useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'

import { postEvent, postSession } from '../lib/api'

export default function SessionRecorder() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const lastSentRef = useRef('')

  useEffect(() => {
    if (!isConnected || !address) return
    if (chainId !== 1) return

    const key = `${address.toLowerCase()}:1`
    if (lastSentRef.current === key) return
    lastSentRef.current = key

    ;(async () => {
      try {
        await postSession({ walletAddress: address, chainId: 1 })
        await postEvent({
          walletAddress: address,
          eventType: 'CONNECT',
          metadata: { chainId: 1 },
        })
      } catch {
        // silent: backend may be offline
      }
    })()
  }, [address, chainId, isConnected])

  return null
}
