import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { VaultEvent, TradeEvent, DepositEvent, WithdrawEvent } from '@/types/vault';
import { format } from 'date-fns';
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp } from 'lucide-react';

interface EventsTableProps {
  events: VaultEvent[];
}

export function EventsTable({ events }: EventsTableProps) {
  const getEventIcon = (event: VaultEvent) => {
    if ('type' in event) {
      return event.type === 'DEPOSIT' ? (
        <ArrowDownToLine className="w-4 h-4 text-success" />
      ) : (
        <ArrowUpFromLine className="w-4 h-4 text-destructive" />
      );
    }
    return <TrendingUp className="w-4 h-4 text-primary" />;
  };

  const getEventType = (event: VaultEvent): string => {
    if ('type' in event) {
      return event.type;
    }
    return 'TRADE';
  };

  const getEventDetails = (event: VaultEvent): string => {
    if ('pair' in event) {
      const trade = event as TradeEvent;
      return `${trade.side} ${trade.qty} ${trade.pair} @ ${trade.price}`;
    }
    if ('type' in event && event.type === 'DEPOSIT') {
      const deposit = event as DepositEvent;
      return `${deposit.amount} USDT → ${deposit.shares} shares`;
    }
    const withdraw = event as WithdrawEvent;
    return `${withdraw.shares} shares → ${withdraw.amount} USDT`;
  };

  if (events.length === 0) {
    return (
      <Card className="p-12 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card text-center">
        <p className="text-muted-foreground">No events yet</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card backdrop-blur-sm border-border/50 shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50">
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Epoch</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="border-border/50">
              <TableCell>
                <div className="flex items-center gap-2">
                  {getEventIcon(event)}
                  <Badge variant="outline">{getEventType(event)}</Badge>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {getEventDetails(event)}
              </TableCell>
              <TableCell>#{event.epochId}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(event.ts), 'MMM dd, HH:mm')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
