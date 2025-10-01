import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { getAdminService, getVaultService } from '@/lib/services';
import { EventsTable } from '@/components/EventsTable';
import { toast } from 'sonner';
import { Loader2, Shield, Settings, Rocket, Zap, CheckCircle } from 'lucide-react';

export default function TraderOnboarding() {
  const { demoMode, events } = useStore();
  const adminService = getAdminService(demoMode);
  const vaultService = getVaultService(demoMode);

  const [loadingTrade, setLoadingTrade] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [loadingProof, setLoadingProof] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [proofLogs, setProofLogs] = useState<string[]>([]);
  const [currentEpoch, setCurrentEpoch] = useState(48);
  
  // Trade form state
  const [tradeForm, setTradeForm] = useState({
    venue: 'DEX-Mock',
    pair: 'TON/USDT',
    side: 'BUY' as 'BUY' | 'SELL',
    amount: '10000',
    minOut: '0',
    deadline: Math.floor(Date.now() / 1000) + 600,
  });
  
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
        venue: tradeForm.venue,
        pair: tradeForm.pair,
        side: tradeForm.side,
        amount: tradeForm.amount,
        minOut: tradeForm.minOut,
        deadline: tradeForm.deadline,
      });
      const evts = await vaultService.getEvents(50);
      useStore.getState().setEvents(evts);
      toast.success('Trade executed successfully');
    } catch (e) {
      toast.error('Trade failed');
    } finally {
      setLoadingTrade(false);
    }
  };

  const handleGenerateProof = async () => {
    setLoadingProof(true);
    setProofGenerated(false);
    setProofProgress(0);
    setProofLogs(["Initializing prover...", "Loading circuit and witnesses..."]); 
    try {
      await new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 3 + 1; // 1% - 4% slower increments
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            resolve();
          }
          setProofProgress(parseFloat(progress.toFixed(0)));
          
          // More detailed log progression
          if (progress > 15 && !proofLogs.includes("Computing proof...")) {
            setProofLogs((logs) => Array.from(new Set([...logs, "Computing proof..."])));
          }
          if (progress > 35 && !proofLogs.includes("Generating constraints...")) {
            setProofLogs((logs) => Array.from(new Set([...logs, "Generating constraints..."])));
          }
          if (progress > 55 && !proofLogs.includes("Running FFT...")) {
            setProofLogs((logs) => Array.from(new Set([...logs, "Running FFT..."])));
          }
          if (progress > 75 && !proofLogs.includes("Compressing proof...")) {
            setProofLogs((logs) => Array.from(new Set([...logs, "Compressing proof..."])));
          }
          if (progress > 90 && !proofLogs.includes("Finalizing proof...")) {
            setProofLogs((logs) => Array.from(new Set([...logs, "Finalizing proof..."])));
          }
        }, 200); // Slower interval for 7-10 second total
      });
      setProofGenerated(true);
      toast.success('zk Proof generated successfully');
    } catch (e) {
      toast.error('Proof generation failed');
    } finally {
      setLoadingProof(false);
    }
  };

  const handleSubmitProof = async () => {
    setSubmittingProof(true);
    try {
      const proofBundle = {
        epochId: currentEpoch,
        publicInputs: { mock: 'data' },
        proof: { mock: 'proof' },
        proofHash: `0x${Math.random().toString(16).substr(2, 8)}`,
      };
      
      await adminService.submitProof(proofBundle);
      toast.success('Proof submitted successfully');
      setCurrentEpoch(prev => prev + 1);
      setProofGenerated(false);
    } catch (e) {
      toast.error('Proof submission failed');
    } finally {
      setSubmittingProof(false);
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
            <h2 className="text-2xl font-semibold">2. Execute Trade</h2>
          </div>
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Venue</Label>
                <Select value={tradeForm.venue} onValueChange={(value) => setTradeForm({...tradeForm, venue: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEX-Mock">DEX Mock</SelectItem>
                    <SelectItem value="CEX-Mock">CEX Mock</SelectItem>
                    <SelectItem value="OTC-Mock">OTC Mock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pair</Label>
                <Select value={tradeForm.pair} onValueChange={(value) => setTradeForm({...tradeForm, pair: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TON/USDT">TON/USDT</SelectItem>
                    <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                    <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Side</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={tradeForm.side === 'BUY' ? 'default' : 'outline'} 
                    onClick={() => setTradeForm({...tradeForm, side: 'BUY'})}
                    className="flex-1"
                  >
                    BUY
                  </Button>
                  <Button 
                    variant={tradeForm.side === 'SELL' ? 'default' : 'outline'} 
                    onClick={() => setTradeForm({...tradeForm, side: 'SELL'})}
                    className="flex-1"
                  >
                    SELL
                  </Button>
                </div>
              </div>
              <div>
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  value={tradeForm.amount} 
                  onChange={(e) => setTradeForm({...tradeForm, amount: e.target.value})} 
                />
              </div>
              <div>
                <Label>Min Output</Label>
                <Input 
                  type="number" 
                  value={tradeForm.minOut} 
                  onChange={(e) => setTradeForm({...tradeForm, minOut: e.target.value})} 
                />
              </div>
              <div>
                <Label>Deadline (seconds)</Label>
                <Input 
                  type="number" 
                  value={tradeForm.deadline} 
                  onChange={(e) => setTradeForm({...tradeForm, deadline: parseInt(e.target.value)})} 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSampleTrade} disabled={loadingTrade} className="bg-gradient-primary">
                {loadingTrade && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Execute Trade
              </Button>
            </div>
          </Card>
        </section>

        <Separator />

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold">3. Generate & Submit ZK Proof for Next Epoch</h2>
          </div>
          <Card className="p-10 rounded-3xl bg-gradient-to-b from-primary/10 via-card to-background border border-primary/30 shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)] min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tight mb-2">Epoch #{currentEpoch}</h3>
                <p className="text-lg text-muted-foreground">Generate zero-knowledge proof for trade verification</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>• Circuit: TradeVerification</span>
                  <span>• Prover: Groth16</span>
                  <span>• Field: BN254</span>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">Mock Mode</Badge>
            </div>
            
            {loadingProof || proofGenerated ? (
              <div className="mb-8">
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${proofGenerated ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-blue-500'} transition-all duration-300`}
                    style={{ width: `${proofProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm mb-6">
                  <span className="font-medium">{proofGenerated ? '✓ Proof ready' : `Progress: ${proofProgress}%`}</span>
                  {!proofGenerated && <span className="animate-pulse text-primary">Working...</span>}
                </div>
                
                {proofLogs.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Proof Generation Log</h4>
                    <div className="grid gap-2 text-sm text-muted-foreground font-mono">
                      {proofLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {proofGenerated && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      <span>Proof Generated Successfully</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>Proof Size: 192 bytes</div>
                      <div>Verification Time: ~2ms</div>
                      <div>Trusted Setup: Ceremony #1</div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            
            <div className="flex gap-4">
              <Button 
                onClick={handleGenerateProof} 
                disabled={loadingProof || proofGenerated}
                variant="outline"
                className="flex-1 h-14 text-lg font-semibold"
              >
                {loadingProof && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {proofGenerated ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Proof Generated
                  </>
                ) : (
                  'Generate zk Proof'
                )}
              </Button>
              <Button 
                onClick={handleSubmitProof} 
                disabled={!proofGenerated || submittingProof}
                className="flex-1 h-14 bg-gradient-primary hover:shadow-glow text-lg font-semibold"
              >
                {submittingProof && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                Submit Proof
              </Button>
            </div>
          </Card>
        </section>

        <Separator />

        <section>
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">4. Publish your vault</h2>
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
