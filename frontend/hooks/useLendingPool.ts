'use client';

import { useReadContract, useAccount, useWatchContractEvent } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI } from '@/lib/contracts';

export interface UserAccountData {
  totalCollateralETH: bigint;
  totalDebtETH: bigint;
  availableBorrowsETH: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

export function useUserAccountData() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, queryKey } = useReadContract({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    functionName: 'getUserAccountData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
      staleTime: 2000,
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Deposit',
    args: address ? { onBehalfOf: address } : undefined,
    onLogs: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Withdraw',
    args: address ? { user: address } : undefined,
    onLogs: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Borrow',
    args: address ? { onBehalfOf: address } : undefined,
    onLogs: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Repay',
    args: address ? { user: address } : undefined,
    onLogs: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const accountData: UserAccountData | undefined = data ? {
    totalCollateralETH: data[0],
    totalDebtETH: data[1],
    availableBorrowsETH: data[2],
    currentLiquidationThreshold: data[3],
    ltv: data[4],
    healthFactor: data[5],
  } : undefined;

  return {
    accountData,
    isLoading,
    error,
    refetch,
    queryKey,
  };
}

export function useHealthFactorWarning() {
  const { accountData } = useUserAccountData();

  if (!accountData) return null;

  const healthFactor = Number(accountData.healthFactor) / 1e18;

  const highRiskThreshold = 1.2;
  const criticalRiskThreshold = 1.0;

  if (healthFactor < criticalRiskThreshold) {
    return {
      level: 'critical' as const,
      message: 'Your position is at risk of liquidation! Repay debt or add collateral immediately.',
      healthFactor,
    };
  } else if (healthFactor < highRiskThreshold) {
    return {
      level: 'warning' as const,
      message: 'Your health factor is low. Consider repaying debt or adding collateral.',
      healthFactor,
    };
  }

  return null;
}
