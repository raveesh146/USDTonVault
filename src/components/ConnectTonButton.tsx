import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getWalletService } from '@/lib/services';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ConnectTonButton() {
  const { walletAddress, setWalletAddress, setUsdtBalance, demoMode } = useStore();
  const walletService = getWalletService(demoMode);

  const handleConnect = async () => {
    try {
      const address = await walletService.connect();
      setWalletAddress(address);
      
      const balance = await walletService.getJettonBalance('usdt');
      setUsdtBalance(balance);
      
      toast.success('Wallet connected', {
        description: `${address.slice(0, 8)}...${address.slice(-6)}`,
      });
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    await walletService.disconnect();
    setWalletAddress(null);
    setUsdtBalance('0');
    toast.info('Wallet disconnected');
  };

  if (walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDisconnect}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2 bg-gradient-primary hover:shadow-glow transition-all">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}
