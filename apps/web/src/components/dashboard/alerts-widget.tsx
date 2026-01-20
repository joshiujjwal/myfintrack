'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const alerts = [
  {
    id: '1',
    type: 'warning',
    title: 'Budget Alert',
    message: 'Food & Dining at 85% of budget',
    time: '2h ago',
  },
  {
    id: '2',
    type: 'info',
    title: 'New Transaction',
    message: 'Large purchase detected: $523.40',
    time: '5h ago',
  },
  {
    id: '3',
    type: 'success',
    title: 'Goal Milestone',
    message: 'Emergency fund reached 50%!',
    time: '1d ago',
  },
];

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
};

const colorMap = {
  warning: 'text-bloomberg-amber',
  info: 'text-bloomberg-blue',
  success: 'text-bloomberg-green',
  error: 'text-bloomberg-red',
};

export function AlertsWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Alerts</CardTitle>
        <Link
          href="/alerts"
          className="text-xs text-bloomberg-amber hover:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = iconMap[alert.type as keyof typeof iconMap];
            const color = colorMap[alert.type as keyof typeof colorMap];

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 py-2 border-b border-terminal-border last:border-0"
              >
                <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {alert.time}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
