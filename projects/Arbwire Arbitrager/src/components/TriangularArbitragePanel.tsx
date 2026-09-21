import React, { useState } from 'react';
import { ArrowRight, Play, RefreshCw, Layers, Sparkles } from 'lucide-react';
import type { TriangularOpportunity } from '../engine/types';
import { SoundFx } from '../services/SoundFx';

interface TriangularArbitragePanelProps {
  opportunities: TriangularOpportunity[];
  onExecuteTriangular: (opp: TriangularOpportunity) => void;
  onAskAiAboutOpportunity?: (opp: TriangularOpportunity) => void;
}

export const TriangularArbitragePanel: React.FC<TriangularArbitragePanelProps> = ({
  opportunities,
  onExecuteTriangular,
  onAskAiAboutOpportunity,
}) => {
  const [selectedOpp, setSelectedOpp] = useState<TriangularOpportunity | null>(
    opportunities[0] || null
  );

  const bestOpp = opportunities[0] || null;

  const handleExecute = (opp: TriangularOpportunity) => {
    SoundFx.playExecutionSound();
    onExecuteTriangular(opp);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner for Best Triangular Loop */}
      {bestOpp && (
        <div className="glass-tile rounded-2xl border border-white/15 p-4 sm:p-5 relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#07090e] to-black">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-white/10 text-white uppercase border border-white/20">
                  TOP 3-HOP TRIANGULAR CYCLE
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                  {bestOpp.hops.length} Execution Hops &bull; Est. Latency: {bestOpp.estimatedLatencyMs}ms
                </span>
              </div>

              {/* Hop Pathway Visualizer */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono pt-1">
                <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-black border border-white/20 font-bold text-white text-[11px] sm:text-xs">
                  {bestOpp.baseAsset}
                </span>
                {bestOpp.hops.map((h, idx) => (
                  <React.Fragment key={idx}>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 animate-pulse shrink-0" />
                    <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[11px] sm:text-xs">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">[{h.exchange}]</span>
                      <span className="font-bold text-slate-100">{h.toAsset}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Profit Metrics & Execution (Responsive Grid on Mobile) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-2 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent border sm:border-0 border-white/10 text-center sm:text-left">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Gross Spread</div>
                  <div className="text-xs sm:text-sm font-mono-nums font-bold text-slate-200">
                    +{bestOpp.grossSpreadBps.toFixed(1)} bps
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase">Net Yield</div>
                  <div className="text-sm sm:text-xl font-mono-nums font-black text-emerald-400">
                    +{bestOpp.netSpreadPct.toFixed(3)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase">Net Profit</div>
                  <div className="text-sm sm:text-xl font-mono-nums font-black text-emerald-400">
                    +${bestOpp.netProfitUSD.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                {onAskAiAboutOpportunity && (
                  <button
                    onClick={() => onAskAiAboutOpportunity(bestOpp)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                    title="Ask AI Quant Copilot to analyze this cycle"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
                <button
                  onClick={() => handleExecute(bestOpp)}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Execute Cycle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cyclic Graph Flow & Opportunities Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Interactive 3-Hop Node Diagram */}
        <div className="lg:col-span-5 glass-tile rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              <h3 className="font-tech font-bold text-sm text-white">CYCLE TOPOLOGY GRAPH</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Directed Graph</span>
          </div>

          <div className="relative w-full h-64 rounded-xl bg-[#03050a]/90 border border-white/[0.06] flex items-center justify-center p-4">
            {selectedOpp || bestOpp ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center Core Indicator */}
                <div className="absolute flex flex-col items-center justify-center w-20 h-20 rounded-full bg-black/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] z-20">
                  <span className="text-[10px] font-mono text-slate-400">NET GAIN</span>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    +{((selectedOpp || bestOpp)!.netSpreadPct).toFixed(2)}%
                  </span>
                </div>

                {/* SVG Connecting Vectors */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
                  <polygon
                    points="50,18 80,68 20,68"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                    className="opacity-70 animate-pulse"
                  />
                </svg>

                {/* Node 1: USDT (Top) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs font-mono font-bold text-white shadow-lg">
                  1. USDT
                </div>

                {/* Node 2: Intermediate Asset 1 (Bottom Right) */}
                <div className="absolute bottom-4 right-6 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs font-mono font-bold text-slate-200 shadow-lg">
                  2. {(selectedOpp || bestOpp)!.hops[0]?.toAsset || 'BTC'}
                </div>

                {/* Node 3: Intermediate Asset 2 (Bottom Left) */}
                <div className="absolute bottom-4 left-6 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs font-mono font-bold text-slate-200 shadow-lg">
                  3. {(selectedOpp || bestOpp)!.hops[1]?.toAsset || 'ETH'}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500">Awaiting triangular graph scan...</div>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
            Bellman-Ford negative-cycle traversal computes continuous log-rate currency conversions across Binance, Coinbase, and Kraken order books.
          </p>
        </div>

        {/* Right 7 Cols: Triangular Opportunities Table */}
        <div className="lg:col-span-7 glass-tile rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-white" />
              <h3 className="font-tech font-bold text-sm text-white">DISCOVERED TRIANGULAR CYCLES</h3>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {opportunities.length} Active Loops
            </span>
          </div>

          <div className="overflow-x-auto touch-scroll-x flex-1 max-h-80 overflow-y-auto">
            <table className="w-full min-w-[500px] text-left text-xs font-mono">
              <thead className="sticky top-0 bg-[#0c0e14] border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Cycle Pathway</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Gross (bps)</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Net Spread (%)</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Est. Profit</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {opportunities.map((opp) => {
                  const isSelected = selectedOpp?.id === opp.id;
                  const isPositive = opp.netSpreadPct > 0;

                  return (
                    <tr
                      key={opp.id}
                      onClick={() => setSelectedOpp(opp)}
                      className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                        isSelected ? 'bg-white/[0.06]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                          <span>{opp.baseAsset}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300">{opp.hops[0]?.toAsset}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300">{opp.hops[1]?.toAsset}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span>{opp.baseAsset}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 whitespace-nowrap">
                          {opp.hops.map((h) => h.exchange.toUpperCase()).join(' &bull; ')}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right font-mono-nums text-slate-300 whitespace-nowrap">
                        +{opp.grossSpreadBps.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right font-mono-nums font-bold whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : 'text-slate-400'}>
                          {isPositive ? '+' : ''}{opp.netSpreadPct.toFixed(3)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right font-mono-nums font-bold whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-400' : 'text-slate-400'}>
                          {isPositive ? '+' : ''}${opp.netProfitUSD.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute(opp);
                          }}
                          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-200 text-black font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          Fill
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
