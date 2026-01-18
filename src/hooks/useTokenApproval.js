import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { erc20Abi, formatUnits, maxUint256, parseUnits } from 'viem'

export function useTokenApproval({ token, spender }) {
  const { address } = useAccount()

  const { data: decimals } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'decimals',
    query: {
      enabled: Boolean(token),
    },
  })

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'symbol',
    query: {
      enabled: Boolean(token),
    },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'allowance',
    args: address ? [address, spender] : undefined,
    query: {
      enabled: Boolean(address && token && spender),
    },
  })

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && token),
    },
  })

  const { writeContractAsync } = useWriteContract()

  async function approveExact(amount) {
    if (!decimals && decimals !== 0) throw new Error('Token decimals not loaded')
    const parsed = parseUnits(amount || '0', decimals)
    const hash = await writeContractAsync({
      abi: erc20Abi,
      address: token,
      functionName: 'approve',
      args: [spender, parsed],
    })
    return hash
  }

  async function approveUnlimited() {
    const hash = await writeContractAsync({
      abi: erc20Abi,
      address: token,
      functionName: 'approve',
      args: [spender, maxUint256],
    })
    return hash
  }

  async function revoke() {
    const hash = await writeContractAsync({
      abi: erc20Abi,
      address: token,
      functionName: 'approve',
      args: [spender, 0n],
    })
    return hash
  }

  const formattedAllowance =
    allowance !== undefined && decimals !== undefined
      ? formatUnits(allowance, decimals)
      : undefined

  const formattedBalance =
    balance !== undefined && decimals !== undefined
      ? formatUnits(balance, decimals)
      : undefined

  return {
    symbol: symbol ?? undefined,
    decimals: decimals ?? undefined,
    allowance: allowance ?? undefined,
    formattedAllowance,
    refetchAllowance,
    balance: balance ?? undefined,
    formattedBalance,
    approveExact,
    approveUnlimited,
    revoke,
  }
}
