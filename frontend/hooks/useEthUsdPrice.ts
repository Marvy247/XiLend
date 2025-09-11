'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, PRICE_ORACLE_ABI } from '@/lib/contracts';
import { formatEther } from 'viem';

export function useEthUsdPrice() {
  const { data: usdcPriceInEth, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.PriceOracle,
    abi: PRICE_ORACLE_ABI,
    functionName: 'getPrice',
    args: [CONTRACT_ADDRESSES.MockUSDC],
    query: {
      staleTime: 300000, // 5 minutes
      refetchInterval: 300000, // 5 minutes
    },
  });

  const ethUsdPrice = usdcPriceInEth ? 1 / parseFloat(formatEther(usdcPriceInEth)) : null;

  return { ethUsdPrice, isLoading, error };
}
