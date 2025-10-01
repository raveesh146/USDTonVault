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
          <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/40 transition-all duration-300">
            <Wallet className="w-4 h-4" />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800/90 backdrop-blur-sm border border-white/20">
          <DropdownMenuItem onClick={handleDisconnect} className="text-white hover:bg-white/10">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}
