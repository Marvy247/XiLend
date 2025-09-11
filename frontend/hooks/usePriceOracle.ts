'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, PRICE_ORACLE_ABI } from '@/lib/contracts';
import { Address } from 'viem';

export function useAssetPrice(asset: Address) {
  const { data: price, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.PriceOracle,
    abi: PRICE_ORACLE_ABI,
    functionName: 'getPrice',
    args: [asset],
    query: {
      enabled: !!asset,
      staleTime: 300000, // 5 minutes
      refetchInterval: 300000, // 5 minutes
    },
  });

  return { price, isLoading, error };
}
