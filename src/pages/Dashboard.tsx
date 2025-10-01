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
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getVaultService, getPricesService } from '@/lib/services';
import { EpochSummary } from '@/types/vault';
import { isAdmin } from '@/lib/config';
import { 
  Settings, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity, 
  Wallet, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [hideSensitiveData, setHideSensitiveData] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, demoMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const vaultService = getVaultService(demoMode);
      const pricesService = getPricesService(demoMode);

      const [stats, eventsList, epochsList, nav] = await Promise.all([
        vaultService.getVaultStats(),
        vaultService.getEvents(50),
        vaultService.getEpochs(),
        pricesService.getNavSeries(),
      ]);

      setVaultStats(stats);
      setEvents(eventsList);
      setEpochs(epochsList);
      setNavSeries(nav);

      if (walletAddress) {
        const position = await vaultService.getMyPosition(walletAddress);
        setMyPosition(position);
      } else {
        setMyPosition({ shares: '0', deposited: '0', withdrawable: '0', unrealizedPnlPct: 0 });
      }
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
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 
                className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate('/')}
              >
                zkCopyVault
              </h1>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-sm">
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="text-sm">
                  Portfolio
                </Button>
                <Button variant="ghost" size="sm" className="text-sm">
                  Analytics
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Demo Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
                <Switch
                  id="demo-mode"
                  checked={demoMode}
                  onCheckedChange={toggleDemoMode}
                  className="scale-75"
                />
                <Label htmlFor="demo-mode" className="text-xs">
                  Demo
                </Label>
              </div>

              {/* Balance Display */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">
                  {hideSensitiveData ? '••••' : parseFloat(usdtBalance).toFixed(2)} USDT
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-auto"
                  onClick={() => setHideSensitiveData(!hideSensitiveData)}
                >
                  {hideSensitiveData ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>

              {/* Admin Button */}
              {isAdmin(walletAddress) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {/* Wallet Connection */}
              <ConnectTonButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
              <p className="text-muted-foreground">
                Track your vault performance and manage your position
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <Shield className="w-3 h-3 mr-1" />
                Epoch #{vaultStats?.epochId || 0}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1 text-success" />
                Verified
              </Badge>
            </div>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">24h</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vault NAV</p>
              <p className="text-2xl font-bold">
                {hideSensitiveData ? '••••••' : `$${parseFloat(vaultStats?.nav || '0').toLocaleString()}`}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success">+2.4%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <Badge variant="secondary" className="text-xs">Current</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price per Share</p>
              <p className="text-2xl font-bold">
                {hideSensitiveData ? '••••' : `$${vaultStats?.pricePerShare || '0'}`}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success">+1.8%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <Badge variant="secondary" className="text-xs">Your Position</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">My Shares</p>
              <p className="text-2xl font-bold">
                {hideSensitiveData ? '••••' : parseFloat(myPosition?.shares || '0').toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <Badge variant="secondary" className="text-xs">Unrealized</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PnL</p>
              <p className={`text-2xl font-bold ${(myPosition?.unrealizedPnlPct || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {hideSensitiveData ? '••••' : `${Math.abs(myPosition?.unrealizedPnlPct || 0).toFixed(2)}%`}
              </p>
              <div className="flex items-center gap-1">
                {(myPosition?.unrealizedPnlPct || 0) >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-xs ${(myPosition?.unrealizedPnlPct || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {(myPosition?.unrealizedPnlPct || 0) >= 0 ? '+' : ''}{(myPosition?.unrealizedPnlPct || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Portfolio Overview & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Summary */}
          <Card className="lg:col-span-2 p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Portfolio Overview</h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Updated 2 min ago
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <p className="text-xl font-bold">
                  {hideSensitiveData ? '••••••' : `$${parseFloat(myPosition?.deposited || '0').toLocaleString()}`}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Withdrawable</p>
                <p className="text-xl font-bold">
                  {hideSensitiveData ? '••••••' : `$${parseFloat(myPosition?.withdrawable || '0').toLocaleString()}`}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Position Health</span>
                <Badge variant="outline" className="text-xs text-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Your position is performing well with 75% of maximum allocation utilized
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => setDepositOpen(true)}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
                size="lg"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Deposit USDT
              </Button>
              <Button
                variant="outline"
                onClick={() => setWithdrawOpen(true)}
                className="w-full"
                size="lg"
              >
                Withdraw Funds
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                size="lg"
              >
                <Activity className="w-4 h-4 mr-2" />
                View History
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Epoch</span>
                <span className="font-medium">#{vaultStats?.epochId || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Verified</span>
                <span className="font-medium">#{vaultStats?.lastVerifiedEpoch || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Performance Fee</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="proofs" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Proofs
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Risk Level: Low
              </Badge>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NavChart data={navSeries} />
              <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">7d Performance</span>
                    <span className="font-medium text-success">+3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">30d Performance</span>
                    <span className="font-medium text-success">+12.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Return</span>
                    <span className="font-medium text-success">+28.7%</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                    <span className="font-medium">2.34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Max Drawdown</span>
                    <span className="font-medium text-destructive">-4.2%</span>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <EventsTable events={events.slice(0, 8)} />
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VaR (95%)</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Beta</span>
                    <span className="font-medium">0.87</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volatility</span>
                    <span className="font-medium">15.2%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Trade Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-medium text-success">68.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Trade Size</span>
                    <span className="font-medium">$2,450</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
                <h3 className="text-lg font-semibold mb-4">Market Exposure</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">BTC</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ETH</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Others</span>
                    <span className="font-medium">37%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proofs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Epoch Verifications</h3>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Verified
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {epochs.map((epoch) => (
                  <EpochCard
                    key={epoch.epochId}
                    epoch={epoch}
                    onClick={() => handleEpochClick(epoch)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Complete Activity Log</h3>
              <EventsTable events={events} />
            </Card>
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
