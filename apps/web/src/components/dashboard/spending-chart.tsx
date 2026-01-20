'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils';

// Mock data for demonstration
const data = [
  { name: 'Housing', value: 1800, color: '#ff9500' },
  { name: 'Food', value: 800, color: '#00d26a' },
  { name: 'Transportation', value: 450, color: '#0a84ff' },
  { name: 'Entertainment', value: 350, color: '#a855f7' },
  { name: 'Utilities', value: 280, color: '#64d2ff' },
  { name: 'Other', value: 520, color: '#666' },
];

const total = data.reduce((acc, item) => acc + item.value, 0);

export function SpendingChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mb-4">
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">Total this month</p>
        </div>
        <div className="space-y-2">
          {data.slice(0, 4).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(item.value)}</span>
                <span className="text-muted-foreground w-10 text-right">
                  {formatPercent(item.value / total, 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
