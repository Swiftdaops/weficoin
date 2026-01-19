import { useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'

import { postEvent, postSession } from '../lib/api'

export default function SessionRecorder() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const prevConnectedRef = useRef(false)
  const prevAddressRef = useRef('')

  useEffect(() => {
    const prevConnected = prevConnectedRef.current
    const prevAddress = prevAddressRef.current

    const normalizedAddress = address ? address.toLowerCase() : ''
    const shouldSend =
      chainId === 1 &&
      Boolean(normalizedAddress) &&
      ((isConnected && !prevConnected) || (isConnected && normalizedAddress !== prevAddress))

    prevConnectedRef.current = Boolean(isConnected)
    prevAddressRef.current = normalizedAddress

    if (!shouldSend) return

    ;(async () => {
      try {
        await postSession({ walletAddress: normalizedAddress, chainId: 1 })
        await postEvent({
          walletAddress: normalizedAddress,
          eventType: 'CONNECT',
          metadata: { chainId: 1 },
        })
      } catch (err) {
        if (import.meta?.env?.DEV) console.warn('SessionRecorder failed', err)
      }
    })()
  }, [address, chainId, isConnected])

  return null
}
