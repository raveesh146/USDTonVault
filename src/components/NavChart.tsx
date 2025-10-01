import { Card } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { NavDataPoint } from '@/types/vault';
import { format } from 'date-fns';

interface NavChartProps {
  data: NavDataPoint[];
}

export function NavChart({ data }: NavChartProps) {
  const chartData = data.map(d => ({
    date: format(new Date(d.ts), 'MMM dd'),
    nav: d.nav,
  }));

  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Vault NAV History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'NAV']}
          />
          <Area
            type="monotone"
            dataKey="nav"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#navGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
