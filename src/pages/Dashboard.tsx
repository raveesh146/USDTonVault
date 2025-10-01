import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { ConnectTonButton } from '@/components/ConnectTonButton';
import { KpiCard } from '@/components/KpiCard';
import { NavChart } from '@/components/NavChart';
import { EventsTable } from '@/components/EventsTable';
import { EpochCard } from '@/components/EpochCard';
import { ProofDetailDrawer } from '@/components/ProofDetailDrawer';
import { DepositModal } from '@/components/DepositModal';
import { WithdrawModal } from '@/components/WithdrawModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getVaultService, getPricesService } from '@/lib/services';
import { EpochSummary } from '@/types/vault';
import { isAdmin } from '@/lib/config';
import { Settings, DollarSign } from 'lucide-react';

const AppPage = () => {
  const navigate = useNavigate();
  const {
    walletAddress,
    usdtBalance,
    vaultStats,
    myPosition,
    events,
    epochs,
    navSeries,
    demoMode,
    toggleDemoMode,
    setVaultStats,
    setMyPosition,
    setEvents,
    setEpochs,
    setNavSeries,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedEpoch, setSelectedEpoch] = useState<EpochSummary | null>(null);
  const [proofDrawerOpen, setProofDrawerOpen] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
      return;
    }

    loadData();
  }, [walletAddress, demoMode]);

  const loadData = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const vaultService = getVaultService(demoMode);
      const pricesService = getPricesService(demoMode);

      const [stats, position, eventsList, epochsList, nav] = await Promise.all([
        vaultService.getVaultStats(),
        vaultService.getMyPosition(walletAddress),
        vaultService.getEvents(50),
        vaultService.getEpochs(),
        pricesService.getNavSeries(),
      ]);

      setVaultStats(stats);
      setMyPosition(position);
      setEvents(eventsList);
      setEpochs(epochsList);
      setNavSeries(nav);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpochClick = (epoch: EpochSummary) => {
    setSelectedEpoch(epoch);
    setProofDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vault data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 
            className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            zkCopyVault
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={toggleDemoMode}
              />
              <Label htmlFor="demo-mode" className="text-sm">
                Demo Mode
              </Label>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">
                {parseFloat(usdtBalance).toFixed(2)} USDT
              </span>
            </div>

            {isAdmin(walletAddress) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            )}

            <ConnectTonButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Vault NAV"
            value={parseFloat(vaultStats?.nav || '0').toLocaleString()}
            prefix="$"
          />
          <KpiCard
            title="Price per Share"
            value={vaultStats?.pricePerShare || '0'}
            prefix="$"
          />
          <KpiCard
            title="My Shares"
            value={parseFloat(myPosition?.shares || '0').toLocaleString()}
          />
          <KpiCard
            title="Unrealized PnL"
            value={Math.abs(myPosition?.unrealizedPnlPct || 0).toFixed(2)}
            suffix="%"
            delta={myPosition?.unrealizedPnlPct}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => setDepositOpen(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            Deposit USDT
          </Button>
          <Button
            variant="outline"
            onClick={() => setWithdrawOpen(true)}
          >
            Withdraw
          </Button>
          <Badge variant="outline" className="px-3">
            Epoch #{vaultStats?.epochId} • Last Verified: #{vaultStats?.lastVerifiedEpoch}
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proofs">Proofs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <NavChart data={navSeries} />
            <EventsTable events={events.slice(0, 10)} />
          </TabsContent>

          <TabsContent value="proofs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {epochs.map((epoch) => (
                <EpochCard
                  key={epoch.epochId}
                  epoch={epoch}
                  onClick={() => handleEpochClick(epoch)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <EventsTable events={events} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <DepositModal open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <ProofDetailDrawer
        open={proofDrawerOpen}
        onOpenChange={setProofDrawerOpen}
        epoch={selectedEpoch}
      />
    </div>
  );
};

export default AppPage;
