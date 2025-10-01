import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { getVaultService } from '@/lib/services';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { usdtBalance, demoMode, vaultStats } = useStore();
  const vaultService = getVaultService(demoMode);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(usdtBalance)) {
      toast.error('Insufficient USDT balance');
      return;
    }

    setLoading(true);
    try {
      const tx = await vaultService.depositUSDT(amount);
      toast.success('Deposit successful', {
        description: `Deposited ${amount} USDT`,
      });
      
      // Refresh data
      const stats = await vaultService.getVaultStats();
      useStore.getState().setVaultStats(stats);
      
      const position = await vaultService.getMyPosition(useStore.getState().walletAddress!);
      useStore.getState().setMyPosition(position);
      
      const events = await vaultService.getEvents(50);
      useStore.getState().setEvents(events);
      
      setAmount('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Deposit failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedShares = vaultStats 
    ? (parseFloat(amount || '0') / parseFloat(vaultStats.pricePerShare)).toFixed(2)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Deposit USDT</DialogTitle>
          <DialogDescription>
            Deposit USDT to receive vault shares at current price
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Balance: {parseFloat(usdtBalance).toFixed(2)} USDT
            </p>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">You will receive</p>
              <p className="text-2xl font-bold">{estimatedShares} shares</p>
              <p className="text-xs text-muted-foreground mt-1">
                Price per share: ${vaultStats?.pricePerShare || '0'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeposit} disabled={loading} className="bg-gradient-primary">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Deposit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
