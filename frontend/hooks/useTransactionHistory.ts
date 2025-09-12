'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES, LENDING_POOL_ABI } from '@/lib/contracts';
import { formatEther, Log, decodeEventLog } from 'viem';

export interface Transaction {
  id: string;
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw';
  amount: number;
  asset: string;
  date: Date;
  txHash: string | null;
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
            event: LENDING_POOL_ABI.filter(item => item.type === 'event').find(item => item.name === eventName),
            args: { user: address }, // This might not work for all events if user is not indexed
            fromBlock: 'earliest',
            toBlock: 'latest',
          })
        );

        const logs = await Promise.all(eventPromises);

        const parsedTransactions = logs.flat().filter(log => log.transactionHash !== null).map((log: Log) => {
          const decoded = decodeEventLog({ abi: LENDING_POOL_ABI, data: log.data, topics: log.topics });
          const type = decoded.eventName.toLowerCase() as Transaction['type'];
          return {
            id: log.transactionHash! + (log.logIndex || 0),
            type: type,
            amount: parseFloat(formatEther(decoded.args.amount as bigint)),
            asset: 'USDC', // Assuming USDC for now
            date: new Date(), // Placeholder, block timestamp would be better
            txHash: log.transactionHash!,
          };
        });

        // A more robust solution would be to get block details for timestamps
        // and sort by block number and log index.
        parsedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransactions(parsedTransactions);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [address, publicClient]);

  return { transactions, isLoading, error };
}
