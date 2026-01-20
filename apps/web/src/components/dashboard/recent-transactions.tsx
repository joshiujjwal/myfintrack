'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  ShoppingCart,
  Coffee,
  Car,
  Home,
  CreditCard,
  TrendingDown,
  Briefcase,
} from 'lucide-react';

// Mock data for demonstration
const transactions = [
  {
    id: '1',
    name: 'Whole Foods Market',
    category: 'Groceries',
    icon: ShoppingCart,
    amount: -127.54,
    date: new Date('2024-01-18'),
    account: 'Chase Checking',
  },
  {
    id: '2',
    name: 'Starbucks',
    category: 'Coffee',
    icon: Coffee,
    amount: -6.45,
    date: new Date('2024-01-18'),
    account: 'Apple Card',
  },
  {
    id: '3',
    name: 'Shell Gas Station',
    category: 'Transportation',
    icon: Car,
    amount: -52.30,
    date: new Date('2024-01-17'),
    account: 'Chase Checking',
  },
  {
    id: '4',
    name: 'Paycheck',
    category: 'Income',
    icon: Briefcase,
    amount: 4250.00,
    date: new Date('2024-01-15'),
    account: 'Chase Checking',
  },
  {
    id: '5',
    name: 'Rent Payment',
    category: 'Housing',
    icon: Home,
    amount: -1800.00,
    date: new Date('2024-01-01'),
    account: 'Chase Checking',
  },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Recent Transactions</CardTitle>
        <Link
          href="/transactions"
          className="text-xs text-bloomberg-amber hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const Icon = tx.icon;
            const isPositive = tx.amount > 0;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-terminal-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-terminal-muted rounded-lg">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category} • {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium tabular-nums ${
                      isPositive ? 'text-bloomberg-green' : ''
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.account}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
