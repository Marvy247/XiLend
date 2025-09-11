'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI } from '@/lib/contracts';
import { formatEther, Log } from 'viem';

export interface Transaction {
  id: string;
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw';
  amount: number;
  asset: string;
  date: Date;
  txHash: string;
}

export function useTransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!address || !publicClient) return;

      setIsLoading(true);
      setError(null);

      try {
        const eventNames = ['Deposit', 'Withdraw', 'Borrow', 'Repay'] as const;
        const eventPromises = eventNames.map(eventName => 
          publicClient.getLogs({
            address: CONTRACT_ADDRESSES.LendingPool,
            event: LENDING_POOL_ABI.find(item => item.type === 'event' && item.name === eventName),
            args: { user: address }, // This might not work for all events if user is not indexed
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        const logs = await Promise.all(eventPromises);
        
        const parsedTransactions = logs.flat().map((log: Log) => {
          const type = log.eventName.toLowerCase() as Transaction['type'];
          return {
            id: log.transactionHash + log.logIndex,
            type: type,
            amount: parseFloat(formatEther(log.args.amount)),
            asset: 'USDC', // Assuming USDC for now
            date: new Date(), // Placeholder, block timestamp would be better
            txHash: log.transactionHash,
          };
        });

        // A more robust solution would be to get block details for timestamps
        // and sort by block number and log index.
        parsedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransactions(parsedTransactions);
      } catch (e: Error) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [address, publicClient]);

  return { transactions, isLoading, error };
}
