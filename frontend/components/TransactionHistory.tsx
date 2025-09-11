'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw';
  amount: number;
  asset: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 2.5,
    asset: 'ETH',
    date: new Date(Date.now() - 3600 * 1000 * 2),
    status: 'completed',
  },
  {
    id: '2',
    type: 'borrow',
    amount: 1.0,
    asset: 'ETH',
    date: new Date(Date.now() - 3600 * 1000 * 5),
    status: 'completed',
  },
  {
    id: '3',
    type: 'repay',
    amount: 0.5,
    asset: 'ETH',
    date: new Date(Date.now() - 3600 * 1000 * 10),
    status: 'pending',
  },
  {
    id: '4',
    type: 'withdraw',
    amount: 1.2,
    asset: 'ETH',
    date: new Date(Date.now() - 3600 * 1000 * 24),
    status: 'failed',
  },
];

const typeToLabel = {
  deposit: { label: 'Deposit', color: 'green' },
  borrow: { label: 'Borrow', color: 'red' },
  repay: { label: 'Repay', color: 'blue' },
  withdraw: { label: 'Withdraw', color: 'orange' },
};

const statusToLabel = {
  completed: { label: 'Completed', color: 'green' },
  pending: { label: 'Pending', color: 'yellow' },
  failed: { label: 'Failed', color: 'red' },
};

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TransactionHistory() {
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
                <th className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
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
                  <td className="p-4 text-sm">
                    <Badge variant="outline" className={`border-${statusToLabel[tx.status].color}-500 text-${statusToLabel[tx.status].color}-600`}>
                      {statusToLabel[tx.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
