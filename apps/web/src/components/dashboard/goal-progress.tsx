'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Target, Home, GraduationCap, Umbrella } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const goals = [
  {
    id: '1',
    name: 'Emergency Fund',
    icon: Umbrella,
    current: 12500,
    target: 25000,
    color: '#00d26a',
    status: 'on_track',
  },
  {
    id: '2',
    name: 'House Down Payment',
    icon: Home,
    current: 35000,
    target: 80000,
    color: '#ff9500',
    status: 'on_track',
  },
  {
    id: '3',
    name: "Child's Education",
    icon: GraduationCap,
    current: 8500,
    target: 50000,
    color: '#0a84ff',
    status: 'at_risk',
  },
];

export function GoalProgressWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Goal Progress</CardTitle>
        <Link
          href="/goals"
          className="text-xs text-bloomberg-amber hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const percent = goal.current / goal.target;
          const Icon = goal.icon;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: goal.color }} />
                  </div>
                  <span className="text-sm font-medium">{goal.name}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    goal.status === 'on_track'
                      ? 'bg-bloomberg-green/20 text-bloomberg-green'
                      : 'bg-bloomberg-amber/20 text-bloomberg-amber'
                  }`}
                >
                  {goal.status === 'on_track' ? 'On Track' : 'At Risk'}
                </span>
              </div>
              <div className="space-y-1">
                <Progress value={percent * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(goal.current)}</span>
                  <span>{formatPercent(percent, 0)} of {formatCurrency(goal.target)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
