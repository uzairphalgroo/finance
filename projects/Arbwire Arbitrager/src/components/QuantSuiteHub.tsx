import React from 'react';
import { Activity, Layers, Bot, Gauge, Grid, Sparkles, ChevronRight } from 'lucide-react';
import type { ArbitrageOpportunity, BotConfig, PortfolioBalance, TriangularOpportunity, ViewMode } from '../engine/types';

interface QuantSuiteHubProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenAiCopilot: () => void;
  bestOpportunity: ArbitrageOpportunity | null;
  triangularOpportunities: TriangularOpportunity[];
  botConfig: BotConfig;
  portfolioBalance: PortfolioBalance;
}

export const QuantSuiteHub: React.FC<QuantSuiteHubProps> = ({
  currentView,
  onSelectView,
  onOpenAiCopilot,
  bestOpportunity,
  triangularOpportunities,
  botConfig,
  portfolioBalance,
}) => {
  const pnl = portfolioBalance.totalEquityUSD - 100000;
  const pnlFormatted = (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(2);

  const topTri = triangularOpportunities[0];

  const modules = [
    {
      id: 'tactical' as ViewMode,
      title: 'TACTICAL MATRIX',
      subtitle: 'L2 Ladder & Venue Spreads',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      badge: bestOpportunity
        ? `+${bestOpportunity.netSpreadPct.toFixed(2)}% Net Spread`
        : 'Scanning Venues',
      badgeColor: bestOpportunity?.isActionable
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : 'bg-white/10 text-slate-300 border-white/15',
    },
    {
      id: 'triangular' as ViewMode,
      title: 'TRIANGULAR GRAPH',
      subtitle: '3-Hop Cyclic Arbitrage',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      badge: topTri
        ? `Top: +${topTri.netSpreadBps.toFixed(1)} bps`
        : `${triangularOpportunities.length} Paths Scanned`,
      badgeColor: topTri?.isActionable
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        : 'bg-white/10 text-slate-300 border-white/15',
    },
    {
      id: 'bot' as ViewMode,
      title: 'AUTONOMOUS BOT',
      subtitle: 'Auto-HFT & Equity Curve',
      icon: <Bot className="w-4 h-4 text-amber-400" />,
      badge: botConfig.autoExecute ? `AUTO ON • ${pnlFormatted}` : `IDLE • ${pnlFormatted}`,
      badgeColor: botConfig.autoExecute
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
        : 'bg-white/10 text-slate-300 border-white/15',
    },
    {
      id: 'microstructure' as ViewMode,
      title: 'MICROSTRUCTURE OBI',
      subtitle: 'Order Book Imbalance & VPIN',
      icon: <Gauge className="w-4 h-4 text-violet-400" />,
      badge: 'Real-time Top-10 Depth',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    },
    {
      id: 'mosaic' as ViewMode,
      title: 'GLOBAL MOSAIC',
      subtitle: '4-Asset Terminal Grid',
      icon: <Grid className="w-4 h-4 text-sky-400" />,
      badge: 'BTC • ETH • SOL • AVAX',
      badgeColor: 'bg-white/10 text-slate-300 border-white/15',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top Suite Header Banner */}
      <div className="glass-tile rounded-2xl p-4 border border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-tech font-black text-sm text-white tracking-wider">
                QUANTITATIVE EXECUTION SUITE
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                5 Active Engines
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Select module below or use header tabs to access dedicated quantitative trading terminals
            </p>
          </div>
        </div>

        {/* AI Copilot Highlight Action */}
        <button
          onClick={onOpenAiCopilot}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/40 hover:to-teal-500/40 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold cursor-pointer transition-all shadow-lg active:scale-95 group"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>OPEN AI QUANT COPILOT</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 5 Dynamic View Module Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {modules.map((m) => {
          const isActive = currentView === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectView(m.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                isActive
                  ? 'bg-white/[0.08] border-white/40 shadow-xl ring-1 ring-white/30'
                  : 'bg-black/50 border-white/10 hover:border-white/25 hover:bg-white/[0.03]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
              )}

              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-lg bg-white/10 border border-white/15">
                  {m.icon}
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${m.badgeColor}`}
                >
                  {m.badge}
                </span>
              </div>

              <div>
                <div className="font-tech font-bold text-xs text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                  {m.title}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {m.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
