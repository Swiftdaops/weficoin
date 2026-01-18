import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { http } from 'viem'
import { createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const walletConnectProjectId = (import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '').trim()

if (!walletConnectProjectId) {
  console.warn(
    'Missing VITE_WALLET_CONNECT_PROJECT_ID. Add it to a .env.local file to enable WalletConnect.',
  )
}

const chains = [mainnet]

export const config = walletConnectProjectId
  ? createConfig({
      chains,
      connectors: connectorsForWallets(
        [
          {
            groupName: 'Recommended',
            wallets: [
              // Put WalletConnect first so the modal naturally guides users to the QR flow.
              walletConnectWallet,
              metaMaskWallet,
              coinbaseWallet,
            ],
          },
        ],
        {
          appName: 'Web3 Approval Demo',
          projectId: walletConnectProjectId,
        }
      ),
      transports: {
        [mainnet.id]: http(),
      },
      ssr: false,
    })
  : createConfig({
      chains,
      connectors: [injected()],
      transports: {
        [mainnet.id]: http(),
      },
      ssr: false,
    })
