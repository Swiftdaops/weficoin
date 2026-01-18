import { formatUnits } from 'viem'
import { useEffect, useRef } from 'react'
import { useAccount, useBalance, useChainId, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { getNonce, postEvent, postLogin, postSession, setStoredJwt } from '../lib/api'

export default function WalletInfo() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const lastSentRef = useRef('')
  const lastAuthRef = useRef('')
  const { signMessageAsync } = useSignMessage()
  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  })

  useEffect(() => {
    if (!isConnected || !address || !chainId) return
    const key = `${address.toLowerCase()}:${chainId}`
    if (lastSentRef.current === key) return
    lastSentRef.current = key

    ;(async () => {
      try {
        await postSession({ walletAddress: address, chainId })
        await postEvent({
          walletAddress: address,
          eventType: 'CONNECT',
          metadata: { chainId },
        })
      } catch {
        // keep UI silent if backend is offline
      }
    })()
  }, [address, chainId, isConnected])

  useEffect(() => {
    if (!isConnected || !address || !chainId) return
    const key = `${address.toLowerCase()}:${chainId}`
    if (lastAuthRef.current === key) return
    lastAuthRef.current = key

    ;(async () => {
      try {
        const nonceRes = await getNonce()
        const nonce = nonceRes?.nonce
        if (!nonce) return

        const siwe = new SiweMessage({
          domain: window.location.hostname,
          address,
          statement: 'Sign in to Web3 Approval Demo',
          uri: window.location.origin,
          version: '1',
          chainId,
          nonce,
          issuedAt: new Date().toISOString(),
        })

        const message = siwe.prepareMessage()
        const signature = await signMessageAsync({ message })
        const loginRes = await postLogin({ message, signature })
        if (loginRes?.token) setStoredJwt(loginRes.token, address)
      } catch {
        // ignore: user may reject signature or backend may be offline
      }
    })()
  }, [address, chainId, isConnected, signMessageAsync])

  if (!isConnected) return null

  return (
    <div style={{ marginTop: 12 }}>
      <div>
        <strong>Address:</strong> {address}
      </div>
      <div>
        <strong>Chain ID:</strong> {chainId}
      </div>
      <div>
        <strong>Native balance:</strong>{' '}
        {balance
          ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`
          : '…'}
      </div>
    </div>
  )
}
