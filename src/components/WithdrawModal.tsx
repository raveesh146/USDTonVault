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

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);
  const { myPosition, demoMode, vaultStats } = useStore();
  const vaultService = getVaultService(demoMode);

  const handleWithdraw = async () => {
    if (!shares || parseFloat(shares) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(shares) > parseFloat(myPosition?.shares || '0')) {
      toast.error('Insufficient shares');
      return;
    }

    setLoading(true);
    try {
      const tx = await vaultService.withdrawShares(shares);
      toast.success('Withdrawal successful', {
        description: `Withdrew ${shares} shares`,
      });
      
      // Refresh data
      const stats = await vaultService.getVaultStats();
      useStore.getState().setVaultStats(stats);
      
      const position = await vaultService.getMyPosition(useStore.getState().walletAddress!);
      useStore.getState().setMyPosition(position);
      
      const events = await vaultService.getEvents(50);
      useStore.getState().setEvents(events);
      
      setShares('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Withdrawal failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedUsdt = vaultStats && shares
    ? (parseFloat(shares) * parseFloat(vaultStats.pricePerShare)).toFixed(2)
    : '0';

  const handleMaxClick = () => {
    setShares(myPosition?.shares || '0');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
          <DialogDescription>
            Burn shares to withdraw USDT at current price
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="shares">Shares</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="shares"
                type="number"
                placeholder="0.00"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleMaxClick} disabled={loading}>
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your shares: {parseFloat(myPosition?.shares || '0').toFixed(2)}
            </p>
          </div>

          {shares && parseFloat(shares) > 0 && (
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">You will receive</p>
              <p className="text-2xl font-bold">{estimatedUsdt} USDT</p>
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
          <Button onClick={handleWithdraw} disabled={loading} className="bg-gradient-primary">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Withdraw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
