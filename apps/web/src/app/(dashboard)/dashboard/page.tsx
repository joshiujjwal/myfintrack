'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCompactCurrency, formatPercent } from '@/lib/utils';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { GoalProgressWidget } from '@/components/dashboard/goal-progress';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { AccountsOverview } from '@/components/dashboard/accounts-overview';
import { AlertsWidget } from '@/components/dashboard/alerts-widget';

// Mock data for demonstration
const mockData = {
  netWorth: 125750.00,
  netWorthChange: 2340.50,
  netWorthChangePercent: 0.019,
  totalAssets: 175000.00,
  totalLiabilities: 49250.00,
  monthlyIncome: 8500.00,
  monthlyExpenses: 5200.00,
  savingsRate: 0.388,
  financialHealthScore: 78,
};

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bloomberg-amber">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="terminal"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Accounts
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Worth"
          value={formatCurrency(mockData.netWorth)}
          change={mockData.netWorthChange}
          changePercent={mockData.netWorthChangePercent}
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          title="Monthly Cash Flow"
          value={formatCurrency(mockData.monthlyIncome - mockData.monthlyExpenses)}
          subtext={`${formatCurrency(mockData.monthlyIncome)} in / ${formatCurrency(mockData.monthlyExpenses)} out`}
          isPositive={mockData.monthlyIncome > mockData.monthlyExpenses}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Savings Rate"
          value={formatPercent(mockData.savingsRate, 1)}
          subtext="Target: 20%"
          isPositive={mockData.savingsRate >= 0.2}
          icon={<Target className="h-5 w-5" />}
        />
        <MetricCard
          title="Financial Health"
          value={`${mockData.financialHealthScore}/100`}
          subtext="Good standing"
          isPositive={mockData.financialHealthScore >= 70}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NetWorthChart />
        </div>
        <div>
          <SpendingChart />
        </div>
      </div>

      {/* Lower Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GoalProgressWidget />
        <RecentTransactions />
        <div className="space-y-4">
          <AccountsOverview />
          <AlertsWidget />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  subtext?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  change,
  changePercent,
  subtext,
  isPositive,
  icon,
}: MetricCardProps) {
  const showChange = change !== undefined && changePercent !== undefined;
  const positive = showChange ? change >= 0 : isPositive;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {showChange && (
              <div className={`flex items-center text-xs ${positive ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
                {positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span>
                  {positive ? '+' : ''}{formatCurrency(change)} ({formatPercent(changePercent, 1)})
                </span>
              </div>
            )}
            {subtext && !showChange && (
              <p className={`text-xs ${positive ? 'text-bloomberg-green' : 'text-muted-foreground'}`}>
                {subtext}
              </p>
            )}
          </div>
          <div className="p-2 bg-terminal-muted rounded-lg text-bloomberg-amber">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
