import { Button } from '@/components/ui/button';
import { ConnectTonButton } from '@/components/ConnectTonButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Shield, Zap, Lock, TrendingUp, Users, Wallet, Percent, ArrowRight, Star, CheckCircle, BarChart3, Globe, Sparkles, Target, Award, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { walletAddress } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'zk-Verified PnL',
      description: 'Every epoch verified with zero-knowledge proofs. Trust mathematics, not promises.',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: Zap,
      title: 'Stablecoin In/Out',
      description: 'Deposit USDT, withdraw USDT. No exposure to volatile assets outside the vault.',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
    },
    {
      icon: Lock,
      title: 'Private Strategies',
      description: 'Leader executes trades privately. Only verified performance is public.',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      icon: TrendingUp,
      title: 'Risk Guards',
      description: 'Automated on-chain limits on position size, slippage, and drawdown.',
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
  ];

  const stats = [
    { label: 'Total Volume', value: '$2.4M', icon: BarChart3 },
    { label: 'Active Traders', value: '127', icon: Users },
    { label: 'Avg. Return', value: '+12.3%', icon: TrendingUp },
    { label: 'Success Rate', value: '94%', icon: Target },
  ];

  const handleEnterApp = () => {
    navigate('/app');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">zkCopyVault</h2>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse hidden md:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 hidden md:block"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="z-50 border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            zkCopyVault
          </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:inline-flex">
              Docs
            </Button>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:inline-flex">
              About
            </Button>
          <ConnectTonButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 md:py-32">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm mb-8">
            <Star className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-white/90">Trusted by 1,000+ investors</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block text-white">Follow elite</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              traders
            </span>
            <span className="block text-white text-2xl sm:text-4xl md:text-6xl mt-4">
              Earn verified profits
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Deposit USDT into proven trading vaults. Zero-knowledge proofs verify every profit. 
            <span className="text-white font-semibold"> Only 10% fee on profits</span> — never on your principal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={handleEnterApp}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Start Trading
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <ConnectTonButton />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`text-center transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How it works</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Three simple steps to start earning verified returns from elite traders
            </p>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Select Leader',
                description: 'Browse performance metrics, risk stats, and trading history. Choose a proven trader you trust.',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-400',
              },
              {
                step: '02',
                icon: Wallet,
                title: 'Deposit USDT',
                description: 'Send USDT to the leader\'s vault and receive shares at the current NAV price.',
                gradient: 'from-purple-500/20 to-pink-500/20',
                iconBg: 'bg-purple-500/10',
                iconColor: 'text-purple-400',
              },
              {
                step: '03',
                icon: Percent,
                title: 'Earn Profits',
                description: 'PnL is zk-verified each epoch. 10% performance fee applies only to profits, never losses.',
                gradient: 'from-green-500/20 to-emerald-500/20',
                iconBg: 'bg-green-500/10',
                iconColor: 'text-green-400',
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className={`relative transition-all duration-700 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  {/* Connection line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0"></div>
                  )}
                  
                  <div className={`relative z-10 p-8 rounded-3xl bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${step.iconColor}`} />
            </div>
                      <div className="text-6xl font-black text-white/10">{step.step}</div>
              </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-white/70 leading-relaxed">{step.description}</p>
            </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Leaders */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Top Leaders</h2>
              <p className="text-xl text-white/70">Proven traders with verified track records</p>
        </div>
            <Button 
              variant="outline" 
              onClick={handleEnterApp}
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              View All Leaders
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
              </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: 'AlphaTrader', 
                pnl30d: '+18.4%', 
                aum: '$420k', 
                followers: '1,203',
                avatar: 'AT',
                verified: true,
                risk: 'Low',
                winRate: '87%',
                gradient: 'from-emerald-500/20 to-green-500/20',
                borderColor: 'border-emerald-500/30',
              },
              { 
                name: 'GammaFlow', 
                pnl30d: '+12.1%', 
                aum: '$310k', 
                followers: '876',
                avatar: 'GF',
                verified: true,
                risk: 'Medium',
                winRate: '82%',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                borderColor: 'border-blue-500/30',
              },
              { 
                name: 'SigmaEdge', 
                pnl30d: '+9.7%', 
                aum: '$215k', 
                followers: '654',
                avatar: 'SE',
                verified: true,
                risk: 'Low',
                winRate: '91%',
                gradient: 'from-purple-500/20 to-pink-500/20',
                borderColor: 'border-purple-500/30',
              },
            ].map((leader, index) => (
              <div
                key={leader.name}
                onClick={handleEnterApp}
                className={`group cursor-pointer transition-all duration-500 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className={`p-8 rounded-3xl bg-gradient-to-br ${leader.gradient} backdrop-blur-sm border ${leader.borderColor} hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold">
                        {leader.avatar}
                </div>
                <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-white">{leader.name}</h3>
                          {leader.verified && <CheckCircle className="w-5 h-5 text-green-400" />}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {leader.risk} Risk
                          </span>
                          <span>{leader.winRate} Win Rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">30d PnL</div>
                      <div className="text-2xl font-bold text-emerald-400">{leader.pnl30d}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-1">AUM</div>
                      <div className="font-semibold text-white">{leader.aum}</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-1">Followers</div>
                      <div className="font-semibold text-white">{leader.followers}</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-sm text-white/60 mb-1">Fee</div>
                      <div className="font-semibold text-white">10%</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    <Button 
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnterApp();
                      }}
                    >
                      Follow Trader
                    </Button>
                </div>
                </div>
              </div>
          ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Choose zkCopyVault</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Built with cutting-edge technology to ensure transparency, security, and maximum returns
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                  className={`group transition-all duration-700 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                  <div className={`p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 h-full`}>
                    <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center p-16 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Trading?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-3xl mx-auto">
              Join thousands of investors earning verified returns from elite traders. 
              Start with as little as $100 USDT.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg"
              onClick={handleEnterApp}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
                Start Trading Now
                <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
              <ConnectTonButton />
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-white/60">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                No fees on principal
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                zk-verified profits
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Instant withdrawals
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  zkCopyVault
                </h3>
              </div>
              <p className="text-white/70 mb-6 max-w-md">
                The future of copy trading. Follow elite traders with zero-knowledge verified profits on TON blockchain.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-3">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  How it Works
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  Leaderboard
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  Analytics
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-3">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  Documentation
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  Community
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 justify-start p-0 h-auto">
                  Contact
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/60 text-sm">
              © 2025 zkCopyVault. All rights reserved. Built on TON blockchain.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
