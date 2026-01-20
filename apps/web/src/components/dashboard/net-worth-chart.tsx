'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/utils';

// Mock data for demonstration
const data = [
  { month: 'Jul', netWorth: 98500, assets: 142000, liabilities: 43500 },
  { month: 'Aug', netWorth: 102300, assets: 145000, liabilities: 42700 },
  { month: 'Sep', netWorth: 108750, assets: 150000, liabilities: 41250 },
  { month: 'Oct', netWorth: 115200, assets: 158000, liabilities: 42800 },
  { month: 'Nov', netWorth: 120400, assets: 168000, liabilities: 47600 },
  { month: 'Dec', netWorth: 125750, assets: 175000, liabilities: 49250 },
];

export function NetWorthChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Net Worth Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9500" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff9500" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d26a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d26a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1a1a"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#1a1a1a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [
                  formatCompactCurrency(value),
                  '',
                ]}
                labelStyle={{ color: '#ff9500' }}
              />
              <Area
                type="monotone"
                dataKey="assets"
                stroke="#00d26a"
                strokeWidth={2}
                fill="url(#assetsGradient)"
                name="Assets"
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#ff9500"
                strokeWidth={2}
                fill="url(#netWorthGradient)"
                name="Net Worth"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-bloomberg-amber rounded-full"></div>
            <span className="text-muted-foreground">Net Worth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-bloomberg-green rounded-full"></div>
            <span className="text-muted-foreground">Assets</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
