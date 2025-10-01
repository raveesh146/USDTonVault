import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function KpiCard({ title, value, delta, prefix = '', suffix = '', className }: KpiCardProps) {
  const deltaColor = delta && delta > 0 ? 'text-success' : delta && delta < 0 ? 'text-destructive' : 'text-muted-foreground';
  const DeltaIcon = delta && delta > 0 ? ArrowUp : delta && delta < 0 ? ArrowDown : Minus;

  return (
    <Card className={cn("p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card", className)}>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">
          {prefix}{value}{suffix}
        </p>
        {delta !== undefined && (
          <span className={cn("flex items-center text-sm font-medium", deltaColor)}>
            <DeltaIcon className="w-3 h-3 mr-1" />
            {Math.abs(delta).toFixed(2)}%
          </span>
        )}
      </div>
    </Card>
  );
}
