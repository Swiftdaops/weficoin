import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function ConnectWallet() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const walletConnectProjectId = (import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '').trim()

  return (
    <div>
      <div className="connect-row">
        <ConnectButton />
        {!isConnected && walletConnectProjectId && openConnectModal ? (
          <button type="button" onClick={openConnectModal}>
            Show QR Code
          </button>
        ) : null}
        {!isConnected && walletConnectProjectId ? (
          <div className="connect-help">Scan the QR with your phone wallet (WalletConnect).</div>
        ) : null}
      </div>
    </div>
  )
}
