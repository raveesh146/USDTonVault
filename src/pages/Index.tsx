import { Button } from '@/components/ui/button';
import { ConnectTonButton } from '@/components/ConnectTonButton';
import { Shield, Zap, Lock, TrendingUp, Users, Wallet, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';

const Index = () => {
  const navigate = useNavigate();
  const { walletAddress } = useStore();

  const features = [
    {
      icon: Shield,
      title: 'zk-Verified PnL',
      description: 'Every epoch verified with zero-knowledge proofs. Trust mathematics, not promises.',
    },
    {
      icon: Zap,
      title: 'Stablecoin In/Out',
      description: 'Deposit USDT, withdraw USDT. No exposure to volatile assets outside the vault.',
    },
    {
      icon: Lock,
      title: 'Private Strategies',
      description: 'Leader executes trades privately. Only verified performance is public.',
    },
    {
      icon: TrendingUp,
      title: 'Risk Guards',
      description: 'Automated on-chain limits on position size, slippage, and drawdown.',
    },
  ];

  const handleEnterApp = () => {
    if (walletAddress) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            zkCopyVault
          </h1>
          <ConnectTonButton />
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Follow elite traders.
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Deposit USDT into their vault.
            </span>
            <br />
            zk-verified profits. 10% fee on profits only.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Pick a leader trader and allocate USDT on TON to their vault. The leader
            executes trades privately; zero-knowledge proofs verify realized PnL each epoch.
            Profits are shared with a 10% performance fee — never on principal or losses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ConnectTonButton />
            {walletAddress && (
              <Button 
                size="lg" 
                onClick={handleEnterApp}
                className="bg-gradient-primary hover:shadow-glow transition-all"
              >
                Enter App
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-semibold text-center mb-10">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-1">1) Select Leader</h4>
              <p className="text-sm text-muted-foreground">Browse performance and risk stats. Choose a trader you trust.</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-1">2) Deposit USDT</h4>
              <p className="text-sm text-muted-foreground">Send USDT to the leader’s vault and receive shares at current price.</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Percent className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-1">3) Earn, Fee on Profits</h4>
              <p className="text-sm text-muted-foreground">PnL is zk-verified each epoch. 10% fee applies only to profits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leader previews */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold">Top leaders</h3>
          <Button variant="outline" onClick={handleEnterApp} disabled={!walletAddress}>View all</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'AlphaTrader', pnl30d: '+18.4%', aum: '$420k', followers: '1,203' },
            { name: 'GammaFlow', pnl30d: '+12.1%', aum: '$310k', followers: '876' },
            { name: 'SigmaEdge', pnl30d: '+9.7%', aum: '$215k', followers: '654' },
          ].map((l) => (
            <button
              key={l.name}
              onClick={handleEnterApp}
              className="text-left p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card hover:shadow-glow transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold">{l.name}</h4>
                <span className="text-sm text-muted-foreground">30d</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{l.pnl30d}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">AUM</p>
                  <p className="font-medium">{l.aum}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Followers</p>
                  <p className="font-medium">{l.followers}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">10%</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border/50 shadow-card">
          <h3 className="text-3xl font-bold mb-4">Ready to start?</h3>
          <p className="text-muted-foreground mb-6">
            Connect your TON wallet and deposit USDT to begin earning verified returns.
          </p>
          {!walletAddress ? (
            <ConnectTonButton />
          ) : (
            <Button 
              size="lg"
              onClick={handleEnterApp}
              className="bg-gradient-primary hover:shadow-glow transition-all"
            >
              Enter App
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Performance fee is 10% on profits only. No fees on principal or losses.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>zkCopyVault © 2025 • Built on TON</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
