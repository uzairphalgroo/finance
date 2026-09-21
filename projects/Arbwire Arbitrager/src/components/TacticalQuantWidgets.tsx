import React from 'react';
import { Bot, Layers, Gauge, Sparkles, ArrowRight, Play, Power } from 'lucide-react';
import type {
  ArbitrageOpportunity,
  BotConfig,
  MicrostructureMetrics,
  PortfolioBalance,
  TriangularOpportunity,
  ViewMode,
} from '../engine/types';
import { SoundFx } from '../services/SoundFx';

interface TacticalQuantWidgetsProps {
  onSelectView: (view: ViewMode) => void;
  onOpenAiCopilot: () => void;
  bestOpportunity: ArbitrageOpportunity | null;
  triangularOpportunities: TriangularOpportunity[];
  microstructureMetrics: MicrostructureMetrics[];
  botConfig: BotConfig;
  onUpdateBotConfig: (cfg: Partial<BotConfig>) => void;
  portfolioBalance: PortfolioBalance;
  onExecuteTriangular: (opp: TriangularOpportunity) => void;
}

export const TacticalQuantWidgets: React.FC<TacticalQuantWidgetsProps> = ({
  onSelectView,
  onOpenAiCopilot,
  bestOpportunity: _bestOpportunity,
  triangularOpportunities,
  microstructureMetrics,
  botConfig,
  onUpdateBotConfig,
  portfolioBalance,
  onExecuteTriangular,
}) => {
  const topTri = triangularOpportunities[0];
  const pnl = portfolioBalance.totalEquityUSD - 100000;
  const pnlFormatted = (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(2);

  const toggleBot = () => {
    SoundFx.playExecutionSound();
    onUpdateBotConfig({ autoExecute: !botConfig.autoExecute });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Autonomous Bot Mini Dashboard */}
      <div className="glass-tile rounded-2xl p-3.5 sm:p-4 border border-white/15 flex flex-col justify-between gap-2.5 sm:gap-3 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-tech font-bold text-xs text-white">AUTONOMOUS BOT</span>
          </div>
          <button
            onClick={toggleBot}
            className={`px-2 sm:px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              botConfig.autoExecute
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{botConfig.autoExecute ? 'RUNNING' : 'OFF'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="p-2 rounded-xl bg-black/50 border border-white/5">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">Total Equity</span>
            <span className="font-mono-nums font-bold text-white text-xs truncate block">
              ${portfolioBalance.totalEquityUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-black/50 border border-white/5">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">Net PnL</span>
            <span className={`font-mono-nums font-bold text-xs truncate block ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnlFormatted}
            </span>
          </div>
        </div>

        <button
          onClick={() => onSelectView('bot')}
          className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[10px] font-bold flex items-center justify-between border border-white/10 cursor-pointer"
        >
          <span>View Live Equity Curve</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* 2. Triangular Arbitrage Scanner Top Alert */}
      <div className="glass-tile rounded-2xl p-3.5 sm:p-4 border border-white/15 flex flex-col justify-between gap-2.5 sm:gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-tech font-bold text-xs text-white">TRIANGULAR SCANNER</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {triangularOpportunities.length} Cycles
          </span>
        </div>

        {topTri ? (
          <div className="space-y-1.5 font-mono">
            <div className="text-[10px] text-slate-400 truncate">
              {topTri.executionPathStr}
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/50 border border-white/5">
              <span className="text-[9px] sm:text-[10px] text-slate-400">Net Yield:</span>
              <span className="text-[11px] sm:text-xs font-mono-nums font-bold text-emerald-400">
                +{topTri.netSpreadBps.toFixed(1)} bps (+${topTri.netProfitUSD.toFixed(2)})
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-black/40 text-center text-[10px] font-mono text-slate-500">
            Computing Bellman-Ford Cycles...
          </div>
        )}

        <div className="flex gap-2">
          {topTri && (
            <button
              onClick={() => onExecuteTriangular(topTri)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-200 text-black font-mono text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Play className="w-3 h-3 fill-black" />
              <span>Fill 3-Hop</span>
            </button>
          )}
          <button
            onClick={() => onSelectView('triangular')}
            className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center border border-white/10 cursor-pointer"
          >
            <span>Topology Graph →</span>
          </button>
        </div>
      </div>

      {/* 3. Microstructure Alpha & Imbalance (OBI) */}
      <div className="glass-tile rounded-2xl p-3.5 sm:p-4 border border-white/15 flex flex-col justify-between gap-2.5 sm:gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <span className="font-tech font-bold text-xs text-white">ORDER BOOK IMBALANCE</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/30">
            Top-5 Depth
          </span>
        </div>

        <div className="space-y-1 font-mono text-[10px]">
          {microstructureMetrics.slice(0, 3).map((m) => {
            const isBullish = m.top5Imbalance > 0;
            return (
              <div key={m.exchange} className="flex items-center justify-between p-1 rounded-lg bg-black/40 border border-white/5">
                <span className="capitalize text-slate-300 font-bold">{m.exchange}</span>
                <div className="flex items-center gap-1.5">
                  <span className={isBullish ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {(m.top5Imbalance * 100).toFixed(1)}%
                  </span>
                  <span className={`px-1 rounded text-[8px] font-bold ${
                    m.directionalPressure === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-300' :
                    m.directionalPressure === 'BEARISH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {m.directionalPressure}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onSelectView('microstructure')}
          className="w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[10px] font-bold flex items-center justify-between border border-white/10 cursor-pointer"
        >
          <span>Deep Microstructure Analysis</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* 4. OpenRouter AI Quant Copilot Diagnostic */}
      <div className="glass-tile rounded-2xl p-3.5 sm:p-4 border border-emerald-500/30 flex flex-col justify-between gap-2.5 sm:gap-3 shadow-lg bg-gradient-to-b from-emerald-950/20 to-black/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <span className="font-tech font-bold text-xs text-white">AI QUANT COPILOT</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            OpenRouter
          </span>
        </div>

        <p className="font-mono text-[10px] text-slate-300 line-clamp-2">
          Autonomous microstructure risk screening and multi-hop routing confidence evaluator active.
        </p>

        <button
          onClick={onOpenAiCopilot}
          className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ask AI Copilot (Open Drawer)</span>
        </button>
      </div>
    </div>
  );
};
