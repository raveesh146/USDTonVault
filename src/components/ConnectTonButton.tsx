import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

export function ConnectTonButton() {
  const { walletAddress, setWalletAddress, setUsdtBalance } = useStore();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const syncFromHook = () => {
    const addr = wallet?.account?.address;
    if (addr) {
      setWalletAddress(addr);
      // TODO: real Jetton balance; placeholder for now
      setUsdtBalance('0');
    }
  };

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal();
      // Defer sync slightly to allow state to update
      setTimeout(syncFromHook, 300);
      if (wallet?.account?.address) {
        const address = wallet.account.address;
        toast.success('Wallet connected', {
          description: `${address.slice(0, 8)}...${address.slice(-6)}`,
        });
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
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
