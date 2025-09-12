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
        const currentBlock = await publicClient.getBlockNumber();
        const eventConfigs = [
          { name: 'Deposit', args: { onBehalfOf: address } },
          { name: 'Withdraw', args: { user: address } },
          { name: 'Borrow', args: { onBehalfOf: address } },
          { name: 'Repay', args: { user: address } },
        ] as const;

        const allLogs: Log[] = [];
        let startBlock = currentBlock;
        const maxTransactions = 100; // Limit to prevent too many requests

        while (allLogs.length < maxTransactions) {
          const fromBlock = startBlock - BigInt(9);
          const toBlock = startBlock;

          const eventPromises = eventConfigs.map(({ name, args }) =>
            publicClient.getLogs({
              address: CONTRACT_ADDRESSES.LendingPool,
              event: LENDING_POOL_ABI.filter(item => item.type === 'event').find(item => item.name === name),
              args: args,
              fromBlock: fromBlock,
              toBlock: toBlock,
            })
          );

          const logs = await Promise.all(eventPromises);
          const flatLogs = logs.flat().filter(log => log.transactionHash !== null && log.blockNumber !== null);
          allLogs.push(...flatLogs);

          if (flatLogs.length === 0 || fromBlock <= BigInt(0)) break;

          startBlock = fromBlock - BigInt(1);
        }

        // Get unique block numbers
        const blockNumbers: bigint[] = allLogs.map(log => log.blockNumber as bigint);
        const uniqueBlockNumbers: bigint[] = [...new Set(blockNumbers)];
        const blocks = await Promise.all(uniqueBlockNumbers.map(bn => publicClient.getBlock({ blockNumber: bn })));
        const blockMap = new Map(blocks.map(block => [block.number, block]));

        const parsedTransactions = allLogs.map((log: Log) => {
          const decoded = decodeEventLog({ abi: LENDING_POOL_ABI, data: log.data, topics: log.topics });
          const type = decoded.eventName.toLowerCase() as Transaction['type'];
          const block = blockMap.get(log.blockNumber as bigint);
          const date = block ? new Date(Number(block.timestamp) * 1000) : new Date();
          return {
            id: log.transactionHash! + (log.logIndex || 0),
            type: type,
            amount: parseFloat((decoded.args.amount as bigint).toString()) / 1e6, // USDC has 6 decimals
            asset: 'USDC',
            date: date,
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
