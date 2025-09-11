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
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 2000, // Consider data fresh for 2 seconds
      gcTime: 300000, // Keep in cache for 5 minutes
    },
  });

  // Watch for borrow events to refetch data immediately
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Borrow',
    args: address ? [undefined, undefined, undefined, address] : undefined,
    onLogs: () => {
      console.log('Borrow event detected, refetching user account data...');
      refetch();
      // Invalidate query cache to force update
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Watch for deposit events to refetch data immediately
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Deposit',
    args: address ? [undefined, undefined, address, undefined] : undefined,
    onLogs: () => {
      console.log('Deposit event detected, refetching user account data...');
      refetch();
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Watch for repay events to refetch data immediately
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.LendingPool,
    abi: LENDING_POOL_ABI,
    eventName: 'Repay',
    args: address ? [undefined, undefined, address] : undefined,
    onLogs: () => {
      console.log('Repay event detected, refetching user account data...');
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

  console.log('useUserAccountData:', { address, accountData, isLoading, error, data });

  const enhancedRefetch = async () => {
    console.log('Refetching user account data...');
    try {
      const result = await refetch();
      console.log('Refetch result:', result);
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('Data after refetch:', accountData);
      }, 1000);
      return result;
    } catch (err) {
      console.error('Refetch failed:', err);
      return { error: err };
    }
  };

  return {
    accountData,
    isLoading,
    error,
    refetch: enhancedRefetch,
    queryKey,
  };
}

export function useHealthFactorWarning() {
  const { accountData } = useUserAccountData();

  if (!accountData) return null;

  const healthFactor = Number(accountData.healthFactor) / 1e18;

  // Warning thresholds
  const highRiskThreshold = 1.2; // Health factor below this shows warning
  const criticalRiskThreshold = 1.0; // Health factor below this shows critical warning

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
