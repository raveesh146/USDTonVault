import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EpochSummary } from '@/types/vault';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpochCardProps {
  epoch: EpochSummary;
  onClick?: () => void;
}

export function EpochCard({ epoch, onClick }: EpochCardProps) {
  const statusConfig = {
    PENDING: { 
      icon: Clock, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Pending'
    },
    VERIFIED: { 
      icon: CheckCircle2, 
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Verified'
    },
    REJECTED: { 
      icon: XCircle, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      label: 'Rejected'
    },
  };

  const config = statusConfig[epoch.status];
  const Icon = config.icon;
  const pnlColor = epoch.pnlPct > 0 ? 'text-success' : epoch.pnlPct < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <Card 
      className={cn(
        "p-4 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card transition-all",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">Epoch</p>
          <p className="text-2xl font-bold">#{epoch.epochId}</p>
        </div>
        <Badge variant="outline" className={cn("gap-1", config.bgColor)}>
          <Icon className={cn("w-3 h-3", config.color)} />
          {config.label}
        </Badge>
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-sm text-muted-foreground">PnL:</p>
        <p className={cn("text-xl font-bold", pnlColor)}>
          {epoch.pnlPct > 0 ? '+' : ''}{epoch.pnlPct.toFixed(2)}%
        </p>
      </div>

      {epoch.proofTx && (
        <p className="text-xs text-muted-foreground mt-2 font-mono truncate">
          Tx: {epoch.proofTx}
        </p>
      )}
    </Card>
  );
}
