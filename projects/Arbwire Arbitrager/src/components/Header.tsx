import React, { useEffect, useState } from 'react';
import { Pause, Play, Settings, Volume2, VolumeX, Activity, BookOpen, Terminal, Sparkles, Layers, Bot, Gauge, Grid, Compass } from 'lucide-react';
import type { EngineConfig, ExchangeId, LatencyMetrics, TradingPair, ViewMode } from '../engine/types';

interface HeaderProps {
  config: EngineConfig;
  metrics: Record<ExchangeId, LatencyMetrics>;
  onSelectPair: (pair: TradingPair) => void;
  onOpenConfig: () => void;
  onOpenGuide: () => void;
  onToggleSound: () => void;
  onOpenCommandPalette: () => void;
  onOpenAiCopilot: () => void;
  onOpenWelcomeScreen: () => void;
  isConnected: boolean;
  onToggleConnect: () => void;
  currentViewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  metrics,
  onSelectPair,
  onOpenConfig,
  onOpenGuide,
  onToggleSound,
  onOpenCommandPalette,
  onOpenAiCopilot,
  onOpenWelcomeScreen,
  isConnected,
  onToggleConnect,
  currentViewMode,
  onSelectViewMode,
}) => {
  const pairs: TradingPair[] = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AVAX/USDT'];
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(11, 23) + ' UTC');
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const connectedCount = Object.values(metrics).filter(
    (m) => m.connectionState === 'CONNECTED'
  ).length;

  const totalMsgSec = Object.values(metrics).reduce((sum, m) => sum + (m.msgPerSecond || 0), 0);

  const viewTabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'tactical', label: 'TACTICAL MATRIX', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'triangular', label: 'TRIANGULAR GRAPH', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'bot', label: 'QUANT BOT & EQUITY', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'microstructure', label: 'MICROSTRUCTURE OBI', icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: 'mosaic', label: 'GLOBAL MOSAIC', icon: <Grid className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="sticky top-0 z-40">
      {/* Top Ticker Bar */}
      <div className="bg-[#020306] border-b border-white/[0.08] overflow-hidden py-1 text-[11px] font-mono select-none">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ARBWIRE QUANTUM SUITE // CROSS-VENUE &bull; TRIANGULAR &bull; AUTONOMOUS HFT
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">THROUGHPUT: <strong className="text-white font-bold">{totalMsgSec} MSG/S</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">ACTIONABLE THRESHOLD: <strong className="text-emerald-400 font-extrabold">&gt; {config.actionableThresholdPct}% NET PROFIT</strong></span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300 font-bold">BINANCE: TOKYO ({metrics.binance?.pingRttMs.toFixed(0)}ms)</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300 font-bold">COINBASE: VIRGINIA ({metrics.coinbase?.pingRttMs.toFixed(0)}ms)</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300 font-bold">KRAKEN: FRANKFURT ({metrics.kraken?.pingRttMs.toFixed(0)}ms)</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-emerald-400 font-bold">AI COPILOT: ONLINE</span>
        </div>
      </div>

      {/* Main Glass Header */}
      <header className="border-b border-white/[0.08] bg-[#07090e]/90 backdrop-blur-2xl px-4 lg:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
            <div
              onClick={onOpenWelcomeScreen}
              className="flex items-center gap-3 cursor-pointer group"
              title="Open Cinematic Architecture Intro"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 shadow-md group-hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="Arbwire" className="w-6 h-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-tech font-black text-lg tracking-wider text-white group-hover:text-emerald-300 transition-colors">
                    ARB<span className="text-emerald-400">WIRE</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold bg-white/10 text-slate-200 border border-white/20">
                    QUANTUM 2.0
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{utcTime}</span>
                  <span>&bull;</span>
                  <span className="text-slate-400">{connectedCount}/3 Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-white/10 text-xs font-mono overflow-x-auto w-full md:w-auto">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-bold whitespace-nowrap cursor-pointer ${
                  currentViewMode === tab.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Tools & Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* AI Quant Copilot Trigger */}
            <button
              onClick={onOpenAiCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              title="Open AI Quant Copilot (OpenRouter)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI COPILOT</span>
            </button>

            {/* Pair Selector dropdown / chips for quick access */}
            <div className="hidden lg:inline-flex p-0.5 rounded-lg bg-slate-950 border border-white/10 text-[10px] font-mono">
              {pairs.map((p) => (
                <button
                  key={p}
                  onClick={() => onSelectPair(p)}
                  className={`px-2 py-1 rounded transition-all font-bold cursor-pointer ${
                    config.activePair === p
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.split('/')[0]}
                </button>
              ))}
            </div>

            {/* Command Palette */}
            <button
              onClick={onOpenCommandPalette}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 transition-all cursor-pointer"
              title="Command Palette (⌘K)"
            >
              <Terminal className="w-4 h-4 text-white" />
            </button>

            {/* Welcome Intro Screen */}
            <button
              onClick={onOpenWelcomeScreen}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 transition-all cursor-pointer"
              title="Cinematic Intro & Architecture (I)"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Guide */}
            <button
              onClick={onOpenGuide}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
              title="User Guide & Terms (G)"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Audio */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                config.soundEnabled
                  ? 'bg-white/10 border-white/20 text-white shadow-sm'
                  : 'bg-slate-950 border-white/10 text-slate-500'
              }`}
              title={config.soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
            >
              {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Config */}
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 transition-all cursor-pointer"
              title="Configuration (C)"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {/* Pause/Play */}
            <button
              onClick={onToggleConnect}
              className={`p-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isConnected
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
              title={isConnected ? 'Pause Stream' : 'Resume Stream'}
            >
              {isConnected ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

