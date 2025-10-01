import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { ConnectTonButton } from '@/components/ConnectTonButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAdminService } from '@/lib/services';
import { isAdmin } from '@/lib/config';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ProofBundle } from '@/types/vault';

const Admin = () => {
  const navigate = useNavigate();
  const { walletAddress, demoMode, riskLimits, setRiskLimits } = useStore();
  const adminService = getAdminService(demoMode);

  const [loading, setLoading] = useState(false);

  // Trade form
  const [tradeForm, setTradeForm] = useState({
    venue: 'DeDust',
    pair: 'TON/USDT',
    side: 'BUY' as 'BUY' | 'SELL',
    amount: '',
    minOut: '',
    deadline: '300',
  });

  // Proof form
  const [proofForm, setProofForm] = useState({
    epochId: '',
    publicInputsJson: '',
    proofJson: '',
  });

  // Risk limits form
  const [limitsForm, setLimitsForm] = useState({
    maxPositionUsd: '',
    maxSlippageBps: '',
    maxDailyTurnoverUsd: '',
    maxDrawdownBps: '',
  });

  useEffect(() => {
    if (!walletAddress || !isAdmin(walletAddress)) {
      navigate('/app');
      return;
    }

    loadRiskLimits();
  }, [walletAddress]);

  const loadRiskLimits = async () => {
    try {
      const limits = await adminService.getRiskLimits();
      setRiskLimits(limits);
      setLimitsForm({
        maxPositionUsd: limits.maxPositionUsd.toString(),
        maxSlippageBps: limits.maxSlippageBps.toString(),
        maxDailyTurnoverUsd: limits.maxDailyTurnoverUsd.toString(),
        maxDrawdownBps: limits.maxDrawdownBps.toString(),
      });
    } catch (error) {
      console.error('Failed to load risk limits:', error);
    }
  };

  const handleExecuteTrade = async () => {
    if (!tradeForm.amount || parseFloat(tradeForm.amount) <= 0) {
      toast.error('Invalid trade amount');
      return;
    }

    setLoading(true);
    try {
      const tx = await adminService.executeTrade({
        venue: tradeForm.venue,
        pair: tradeForm.pair,
        side: tradeForm.side,
        amount: tradeForm.amount,
        minOut: tradeForm.minOut,
        deadline: parseInt(tradeForm.deadline),
      });

      toast.success('Trade executed', {
        description: `${tradeForm.side} ${tradeForm.amount} ${tradeForm.pair}`,
      });

      // Reset form
      setTradeForm({ ...tradeForm, amount: '', minOut: '' });
    } catch (error) {
      toast.error('Trade failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEpoch = async () => {
    setLoading(true);
    try {
      await adminService.closeEpoch();
      toast.success('Epoch closed');
    } catch (error) {
      toast.error('Failed to close epoch');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofForm.epochId || !proofForm.publicInputsJson || !proofForm.proofJson) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const publicInputs = JSON.parse(proofForm.publicInputsJson);
      const proof = JSON.parse(proofForm.proofJson);

      const bundle: ProofBundle = {
        epochId: parseInt(proofForm.epochId),
        publicInputs,
        proof,
        proofHash: `0xmock${Date.now()}`,
      };

      const tx = await adminService.submitProof(bundle);
      
      useStore.getState().updateEpoch(bundle.epochId, {
        status: 'VERIFIED',
        proofTx: tx,
      });

      toast.success('Proof submitted', {
        description: `Epoch #${bundle.epochId} verified`,
      });

      setProofForm({ epochId: '', publicInputsJson: '', proofJson: '' });
    } catch (error) {
      toast.error('Invalid proof data or submission failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimits = async () => {
    setLoading(true);
    try {
      const limits = {
        maxPositionUsd: parseFloat(limitsForm.maxPositionUsd),
        maxSlippageBps: parseInt(limitsForm.maxSlippageBps),
        maxDailyTurnoverUsd: parseFloat(limitsForm.maxDailyTurnoverUsd),
        maxDrawdownBps: parseInt(limitsForm.maxDrawdownBps),
      };

      await adminService.setRiskLimits(limits);
      setRiskLimits(limits);
      toast.success('Risk limits updated');
    } catch (error) {
      toast.error('Failed to update limits');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Leader Panel
            </h1>
          </div>
          <ConnectTonButton />
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="trade" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="trade">Execute Trade</TabsTrigger>
            <TabsTrigger value="epoch">Epoch Controls</TabsTrigger>
            <TabsTrigger value="limits">Risk Limits</TabsTrigger>
          </TabsList>

          {/* Trade Tab */}
          <TabsContent value="trade">
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Execute Trade</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Select
                      value={tradeForm.venue}
                      onValueChange={(value) => setTradeForm({ ...tradeForm, venue: value })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DeDust">DeDust</SelectItem>
                        <SelectItem value="Ston.fi">Ston.fi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pair">Pair</Label>
                    <Select
                      value={tradeForm.pair}
                      onValueChange={(value) => setTradeForm({ ...tradeForm, pair: value })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TON/USDT">TON/USDT</SelectItem>
                        <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                        <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="side">Side</Label>
                    <Select
                      value={tradeForm.side}
                      onValueChange={(value: 'BUY' | 'SELL') => setTradeForm({ ...tradeForm, side: value })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.amount}
                      onChange={(e) => setTradeForm({ ...tradeForm, amount: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOut">Min Out</Label>
                    <Input
                      id="minOut"
                      type="number"
                      placeholder="0.00"
                      value={tradeForm.minOut}
                      onChange={(e) => setTradeForm({ ...tradeForm, minOut: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline">Deadline (seconds)</Label>
                    <Input
                      id="deadline"
                      type="number"
                      value={tradeForm.deadline}
                      onChange={(e) => setTradeForm({ ...tradeForm, deadline: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleExecuteTrade}
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Execute Trade
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Epoch Tab */}
          <TabsContent value="epoch" className="space-y-6">
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Close Epoch</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Close the current epoch and calculate final PnL
              </p>
              <Button
                onClick={handleCloseEpoch}
                disabled={loading}
                className="bg-gradient-primary"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Close Epoch
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Submit Proof</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="epochId">Epoch ID</Label>
                  <Input
                    id="epochId"
                    type="number"
                    placeholder="5"
                    value={proofForm.epochId}
                    onChange={(e) => setProofForm({ ...proofForm, epochId: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="publicInputs">Public Inputs (JSON)</Label>
                  <Textarea
                    id="publicInputs"
                    placeholder='{"vaultAddress": "...", "epochId": 5, ...}'
                    value={proofForm.publicInputsJson}
                    onChange={(e) => setProofForm({ ...proofForm, publicInputsJson: e.target.value })}
                    className="mt-1.5 font-mono text-xs"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="proof">Proof (JSON)</Label>
                  <Textarea
                    id="proof"
                    placeholder='{"a": [...], "b": [...], "c": [...]}'
                    value={proofForm.proofJson}
                    onChange={(e) => setProofForm({ ...proofForm, proofJson: e.target.value })}
                    className="mt-1.5 font-mono text-xs"
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Proof
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Risk Limits Tab */}
          <TabsContent value="limits">
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Risk Limits</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxPosition">Max Position (USD)</Label>
                  <Input
                    id="maxPosition"
                    type="number"
                    value={limitsForm.maxPositionUsd}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxPositionUsd: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="maxSlippage">Max Slippage (BPS)</Label>
                  <Input
                    id="maxSlippage"
                    type="number"
                    value={limitsForm.maxSlippageBps}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxSlippageBps: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    100 BPS = 1%
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxTurnover">Max Daily Turnover (USD)</Label>
                  <Input
                    id="maxTurnover"
                    type="number"
                    value={limitsForm.maxDailyTurnoverUsd}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxDailyTurnoverUsd: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDrawdown">Max Drawdown (BPS)</Label>
                  <Input
                    id="maxDrawdown"
                    type="number"
                    value={limitsForm.maxDrawdownBps}
                    onChange={(e) => setLimitsForm({ ...limitsForm, maxDrawdownBps: e.target.value })}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    2000 BPS = 20%
                  </p>
                </div>

                <Button
                  onClick={handleUpdateLimits}
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Limits
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
