import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import { getAdminService, getVaultService } from '@/lib/services';
import { EventsTable } from '@/components/EventsTable';
import { toast } from 'sonner';
import { Loader2, Shield, Settings, Rocket } from 'lucide-react';

export default function TraderOnboarding() {
  const { demoMode, events } = useStore();
  const adminService = getAdminService(demoMode);
  const vaultService = getVaultService(demoMode);

  const [loadingTrade, setLoadingTrade] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [pair, setPair] = useState('TON/USDT');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('10000');
  const [limits, setLimits] = useState({
    maxPositionUsd: 500000,
    maxSlippageBps: 100,
    maxDailyTurnoverUsd: 1000000,
    maxDrawdownBps: 2000,
  });

  useEffect(() => {
    (async () => {
      const evts = await vaultService.getEvents(50);
      useStore.getState().setEvents(evts);
    })();
  }, []);

  const handleSetLimits = async () => {
    try {
      await adminService.setRiskLimits(limits);
      toast.success('Risk limits updated');
      useStore.getState().setRiskLimits(limits);
    } catch (e) {
      toast.error('Failed to update limits');
    }
  };

  const handleSampleTrade = async () => {
    setLoadingTrade(true);
    try {
      await adminService.executeTrade({
        venue: 'DEX-Mock',
        pair,
        side,
        amount,
        minOut: '0',
        deadline: Math.floor(Date.now() / 1000) + 600,
      });
      const evts = await vaultService.getEvents(50);
      useStore.getState().setEvents(evts);
      toast.success('Sample trade executed');
    } catch (e) {
      toast.error('Trade failed');
    } finally {
      setLoadingTrade(false);
    }
  };

  const handlePublish = async () => {
    setLoadingPublish(true);
    try {
      // In hackathon mode this just toasts and routes users to /app
      toast.success('Vault published and discoverable');
      window.location.href = '/app';
    } catch (e) {
      toast.error('Publish failed');
    } finally {
      setLoadingPublish(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Trader Onboarding</h1>
          <Badge variant="outline">Hackathon Mode</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">1. Configure risk limits</h2>
          </div>
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Max position (USD)</Label>
                <Input type="number" value={limits.maxPositionUsd} onChange={(e) => setLimits({ ...limits, maxPositionUsd: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Max slippage (bps)</Label>
                <Input type="number" value={limits.maxSlippageBps} onChange={(e) => setLimits({ ...limits, maxSlippageBps: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Max daily turnover (USD)</Label>
                <Input type="number" value={limits.maxDailyTurnoverUsd} onChange={(e) => setLimits({ ...limits, maxDailyTurnoverUsd: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Max drawdown (bps)</Label>
                <Input type="number" value={limits.maxDrawdownBps} onChange={(e) => setLimits({ ...limits, maxDrawdownBps: Number(e.target.value) })} />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSetLimits} variant="secondary" className="bg-primary/10">Save limits</Button>
            </div>
          </Card>
        </section>

        <Separator />

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">2. Execute a sample trade</h2>
          </div>
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Pair</Label>
                <Input value={pair} onChange={(e) => setPair(e.target.value)} />
              </div>
              <div>
                <Label>Side</Label>
                <div className="flex gap-2">
                  <Button variant={side === 'BUY' ? 'default' : 'outline'} onClick={() => setSide('BUY')}>BUY</Button>
                  <Button variant={side === 'SELL' ? 'default' : 'outline'} onClick={() => setSide('SELL')}>SELL</Button>
                </div>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSampleTrade} disabled={loadingTrade} className="w-full bg-gradient-primary">
                  {loadingTrade && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Execute Trade
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">3. Publish your vault</h2>
          </div>
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Make your vault discoverable to followers on the home page.</p>
              <p className="text-xs text-muted-foreground">This action is mocked for hackathon demo purposes.</p>
            </div>
            <Button onClick={handlePublish} disabled={loadingPublish} className="bg-gradient-primary">
              {loadingPublish && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publish Vault
            </Button>
          </Card>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Recent activity</h3>
          <EventsTable events={events} />
        </section>
      </main>
    </div>
  );
}
