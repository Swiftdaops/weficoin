import { useMemo, useState } from 'react'
import { isAddress, parseEther, parseUnits } from 'viem'
import { erc20Abi } from 'viem'
import { useAccount, useChainId, useReadContract, useSendTransaction, useWriteContract } from 'wagmi'

const ASSETS = {
  ETH: { type: 'native' },
  USDT: {
    type: 'erc20',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
}

export default function SendPayment() {
  const { isConnected } = useAccount()
  const chainId = useChainId()

  const [asset, setAsset] = useState('ETH')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [lastTxHash, setLastTxHash] = useState('')

  const selected = ASSETS[asset]

  const tokenAddress = selected?.type === 'erc20' ? selected.address : undefined

  const { data: tokenDecimals } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'decimals',
    query: {
      enabled: Boolean(tokenAddress),
    },
  })

  const { sendTransactionAsync } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()

  const validation = useMemo(() => {
    const normalizedTo = String(to || '').trim()
    const normalizedAmount = String(amount || '').trim()

    if (!isConnected) return { ok: false, message: 'Connect wallet first' }
    if (chainId !== 1) return { ok: false, message: 'Switch to Ethereum mainnet' }
    if (!isAddress(normalizedTo)) return { ok: false, message: 'Enter a valid recipient (0x...)' }
    if (!normalizedAmount) return { ok: false, message: 'Enter an amount' }

    try {
      if (selected?.type === 'native') {
        const value = parseEther(normalizedAmount)
        if (value <= 0n) return { ok: false, message: 'Amount must be greater than 0' }
        return { ok: true }
      }

      if (selected?.type === 'erc20') {
        if (tokenDecimals === undefined) return { ok: false, message: 'Loading token decimals…' }
        const value = parseUnits(normalizedAmount, tokenDecimals)
        if (value <= 0n) return { ok: false, message: 'Amount must be greater than 0' }
        return { ok: true }
      }

      return { ok: false, message: 'Unsupported asset' }
    } catch {
      return { ok: false, message: 'Invalid amount format' }
    }
  }, [amount, chainId, isConnected, selected?.type, to, tokenDecimals])

  async function onSend() {
    setError('')
    setLastTxHash('')

    if (!validation.ok) {
      setError(validation.message || 'Invalid input')
      return
    }

    const normalizedTo = String(to || '').trim()
    const normalizedAmount = String(amount || '').trim()

    setSending(true)
    try {
      if (selected.type === 'native') {
        const hash = await sendTransactionAsync({
          to: normalizedTo,
          value: parseEther(normalizedAmount),
        })
        setLastTxHash(hash)
        return
      }

      if (selected.type === 'erc20') {
        const decimals = tokenDecimals
        if (decimals === undefined) throw new Error('Token decimals not loaded')

        const hash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress,
          functionName: 'transfer',
          args: [normalizedTo, parseUnits(normalizedAmount, decimals)],
        })
        setLastTxHash(hash)
        return
      }

      throw new Error('Unsupported asset')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="text-sm font-semibold text-slate-100">Send Payment (WalletConnect)</div>
        <div className="mt-2 text-sm text-slate-300">
          This will open Trust Wallet for confirmation. ETH and USDT transfers only.
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-200">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT (ERC-20)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Recipient (0x...)</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={asset === 'ETH' ? '0.015' : '10'}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={sending || !validation.ok}
            className={
              'w-full rounded-xl px-4 py-3 text-sm font-bold tracking-wide text-slate-900 bg-gradient-to-r from-amber-300 to-yellow-500 ' +
              (sending || !validation.ok
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-amber-200 hover:to-yellow-400')
            }
          >
            {sending ? 'Confirm in wallet…' : 'Send'}
          </button>

          {!validation.ok && validation.message ? (
            <div className="text-sm text-slate-300">{validation.message}</div>
          ) : null}

          {error ? <div className="text-sm text-rose-300">{error}</div> : null}
          {lastTxHash ? (
            <div className="text-sm text-slate-200">
              Tx: <span className="font-mono text-xs">{lastTxHash}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
