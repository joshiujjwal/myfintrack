'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Building2, CreditCard, Landmark, TrendingUp } from 'lucide-react';

// Mock data for demonstration
const accounts = [
  {
    id: '1',
    name: 'Chase Checking',
    type: 'checking',
    icon: Building2,
    balance: 8432.50,
    institution: 'Chase',
  },
  {
    id: '2',
    name: 'Marcus Savings',
    type: 'savings',
    icon: Landmark,
    balance: 25000.00,
    institution: 'Goldman Sachs',
  },
  {
    id: '3',
    name: 'Apple Card',
    type: 'credit',
    icon: CreditCard,
    balance: -1842.30,
    institution: 'Apple',
  },
  {
    id: '4',
    name: 'Fidelity 401k',
    type: 'investment',
    icon: TrendingUp,
    balance: 89500.00,
    institution: 'Fidelity',
  },
];

export function AccountsOverview() {
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Accounts</CardTitle>
        <Link
          href="/accounts"
          className="text-xs text-bloomberg-amber hover:underline"
        >
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {accounts.map((account) => {
            const Icon = account.icon;
            const isNegative = account.balance < 0;

            return (
              <div
                key={account.id}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{account.name}</span>
                </div>
                <span
                  className={`text-sm tabular-nums ${
                    isNegative ? 'text-bloomberg-red' : ''
                  }`}
                >
                  {formatCurrency(account.balance)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-terminal-border flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-sm font-bold">{formatCurrency(totalBalance)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
