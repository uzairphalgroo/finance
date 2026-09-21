import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, ShieldAlert, Cpu } from 'lucide-react';
import type { MicrostructureMetrics } from '../engine/types';

interface MicrostructureAlphaPanelProps {
  metrics: MicrostructureMetrics[];
  activePair: string;
}

export const MicrostructureAlphaPanel: React.FC<MicrostructureAlphaPanelProps> = ({
  metrics,
  activePair,
}) => {
  const getImbalanceColor = (val: number) => {
    if (val > 0.25) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (val < -0.25) return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
    return 'text-slate-300 bg-white/10 border-white/15';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-tile rounded-2xl border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 text-white">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-tech font-bold text-sm text-white tracking-wider">
                ORDER BOOK IMBALANCE (OBI) &amp; MICROSTRUCTURE ALPHA
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-200 border border-white/20">
                {activePair}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Sub-millisecond liquidity skew, price drift velocity &amp; adverse selection VPIN toxicity
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 font-bold">
          Top-5 &amp; Top-10 Book Sweep
        </span>
      </div>

      {/* 3 Venue Deep Microstructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m) => {
          const isBullish = m.directionalPressure === 'BULLISH';
          const isBearish = m.directionalPressure === 'BEARISH';
          const isHighTox = m.toxicityVpin > 0.6;

          return (
            <div
              key={m.exchange}
              className="glass-tile rounded-2xl border border-white/10 p-5 space-y-4 relative overflow-hidden"
            >
              {/* Venue Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-tech font-black text-base uppercase text-white">{m.exchange}</span>
                  <div className="text-[10px] font-mono text-slate-400">{m.pair}</div>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
                  isBullish ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  isBearish ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  'bg-white/10 text-slate-300 border-white/15'
                }`}>
                  {isBullish ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                   isBearish ? <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> :
                   <Minus className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{m.directionalPressure}</span>
                </div>
              </div>

              {/* OBI Meter Bar (-100% to +100%) */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className="text-slate-300">Top-5 Level Imbalance:</span>
                  <span className={`px-2 py-0.5 rounded border text-xs font-black font-mono-nums ${getImbalanceColor(m.top5Imbalance)}`}>
                    {m.top5Imbalance > 0 ? '+' : ''}{(m.top5Imbalance * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Bi-directional balance bar */}
                <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  {/* Left (Ask Dominance) */}
                  <div className="w-1/2 flex justify-end">
                    {m.top5Imbalance < 0 && (
                      <div
                        className="h-full bg-rose-500 rounded-l"
                        style={{ width: `${Math.min(100, Math.abs(m.top5Imbalance) * 100)}%` }}
                      />
                    )}
                  </div>
                  <div className="w-0.5 h-full bg-white z-10" />
                  {/* Right (Bid Dominance) */}
                  <div className="w-1/2">
                    {m.top5Imbalance > 0 && (
                      <div
                        className="h-full bg-emerald-400 rounded-r"
                        style={{ width: `${Math.min(100, m.top5Imbalance * 100)}%` }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                  <span>-100% Ask Skew</span>
                  <span>Neutral</span>
                  <span>+100% Bid Skew</span>
                </div>
              </div>

              {/* Depth & VPIN Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Bid Depth (Top 10)</div>
                  <div className="text-sm font-mono-nums font-bold text-emerald-400 mt-1">
                    ${(m.bidDepthUSD / 1000).toFixed(1)}k
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Ask Depth (Top 10)</div>
                  <div className="text-sm font-mono-nums font-bold text-rose-400 mt-1">
                    ${(m.askDepthUSD / 1000).toFixed(1)}k
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Inside Spread</div>
                  <div className="text-sm font-mono-nums font-bold text-white mt-1">
                    {m.spreadBps.toFixed(1)} <span className="text-[10px] text-slate-400">bps</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${isHighTox ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/80 border-white/10'}`}>
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>VPIN Toxicity</span>
                    {isHighTox && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                  </div>
                  <div className={`text-sm font-mono-nums font-bold mt-1 ${isHighTox ? 'text-rose-400' : 'text-slate-200'}`}>
                    {(m.toxicityVpin * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Alpha Indicator Note */}
              <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono text-slate-400 flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                <span>
                  Predicted TOB drift: <strong>{m.predictedSpreadShiftBps > 0 ? '+' : ''}{m.predictedSpreadShiftBps.toFixed(2)} bps</strong> within next 200ms.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
