'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { useTransactionHistory, Transaction } from '@/hooks/useTransactionHistory';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const typeToLabel = {
  deposit: { label: 'Deposit', color: 'green' },
  borrow: { label: 'Borrow', color: 'red' },
  repay: { label: 'Repay', color: 'blue' },
  withdraw: { label: 'Withdraw', color: 'orange' },
};

export function TransactionHistory() {
  const { transactions, isLoading, error } = useTransactionHistory();

  if (error) {
    return (
      <Card className="glass border-0 hover:shadow-xl transition-all duration-300 mt-16">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <CardTitle>Transaction History & Activity Logs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-red-500">
          Error loading transactions: {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-0 hover:shadow-xl transition-all duration-300 mt-16">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <CardTitle>Transaction History & Activity Logs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-40" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-48" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <Badge variant="outline" className={`border-${typeToLabel[tx.type].color}-500 text-${typeToLabel[tx.type].color}-600`}>
                        {typeToLabel[tx.type].label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {tx.amount.toFixed(4)} {tx.asset}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(tx.date)}</td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline"
                      >
                        {tx.txHash.substring(0, 6)}...{tx.txHash.substring(tx.txHash.length - 4)}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
