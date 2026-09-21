import React from 'react';
import { Activity, Clock, Cpu, Gauge, RefreshCw, Server } from 'lucide-react';
import type { ExchangeId, LatencyMetrics } from '../engine/types';

interface LatencyTelemetryPanelProps {
  metrics: Record<ExchangeId, LatencyMetrics>;
}

export const LatencyTelemetryPanel: React.FC<LatencyTelemetryPanelProps> = ({ metrics }) => {
  const exchanges: { id: ExchangeId; name: string; region: string }[] = [
    { id: 'binance', name: 'Binance', region: 'Tokyo / AWS ap-northeast-1' },
    { id: 'coinbase', name: 'Coinbase', region: 'US East / AWS us-east-1' },
    { id: 'kraken', name: 'Kraken', region: 'Frankfurt / Cloudflare Edge' },
  ];

  const getSaturationColor = (pct: number) => {
    if (pct < 40) return 'bg-emerald-500';
    if (pct < 75) return 'bg-amber-400';
    return 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="glass-tile rounded-2xl border border-white/10 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-tech font-bold text-xs sm:text-sm text-slate-100 tracking-wider">
              SUB-MILLISECOND NETWORK &amp; QUEUE HUD
            </h3>
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              Live Ping RTT, Welford Inter-Arrival Jitter &amp; Ring Buffer Diagnostics
            </p>
          </div>
        </div>
        <span className="text-[11px] sm:text-xs font-mono text-slate-300 flex items-center gap-1.5 font-bold self-end sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Direct WebSocket Feeds
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {exchanges.map((ex) => {
          const m = metrics[ex.id] || {
            exchange: ex.id,
            connectionState: 'DISCONNECTED',
            pingRttMs: 0,
            avgPingRttMs: 0,
            minPingRttMs: 0,
            maxPingRttMs: 0,
            packetJitterMs: 0,
            msgPerSecond: 0,
            totalMessages: 0,
            droppedMessages: 0,
            queueSaturationPct: 0,
            lastMsgTimestamp: 0,
            orderBookDriftMs: 0,
            reconnectCount: 0,
          };

          const isConnected = m.connectionState === 'CONNECTED';

          return (
            <div
              key={ex.id}
              className="glass-tile card-3d rounded-2xl bg-black/90 border border-white/10 p-3.5 sm:p-4.5 space-y-3 sm:space-y-4 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-tech font-black text-sm sm:text-base text-white">{ex.name}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${
                      isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-900 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                      {m.connectionState}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5">{ex.region}</p>
                </div>

                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Ping RTT</div>
                  <div className="text-base sm:text-xl font-mono-nums font-black text-white">
                    {m.pingRttMs.toFixed(1)} <span className="text-[10px] sm:text-xs text-slate-400 font-normal">ms</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-xs font-mono">
                {/* Jitter */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-white/[0.08] shadow-inner">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">
                    <span>Arrival Jitter</span>
                    <Clock className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono-nums font-black text-slate-200 mt-0.5 sm:mt-1">
                    {m.packetJitterMs.toFixed(2)} ms
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500">Welford variance</div>
                </div>

                {/* Tick Frequency */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-white/[0.08] shadow-inner">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">
                    <span>Message Rate</span>
                    <Gauge className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono-nums font-black text-emerald-300 mt-0.5 sm:mt-1">
                    {m.msgPerSecond} <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">msg/s</span>
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500 truncate">Total: {m.totalMessages.toLocaleString()}</div>
                </div>

                {/* Clock Drift / Transit Lag */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-white/[0.08] shadow-inner">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">
                    <span>Clock Drift</span>
                    <Server className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono-nums font-black text-slate-200 mt-0.5 sm:mt-1">
                    {m.orderBookDriftMs} ms
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500">Exchange vs local</div>
                </div>

                {/* Reconnections & Errors */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-white/[0.08] shadow-inner">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">
                    <span>Reconnects</span>
                    <RefreshCw className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="text-xs sm:text-sm font-mono-nums font-black text-slate-200 mt-0.5 sm:mt-1">
                    {m.reconnectCount}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500">Auto backoff</div>
                </div>
              </div>

              {/* Buffer Saturation Bar */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono mb-1.5 font-bold">
                  <span className="text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-300" />
                    Lock-Free Ring Buffer
                  </span>
                  <span className="font-mono-nums text-slate-300">
                    {m.queueSaturationPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getSaturationColor(m.queueSaturationPct)}`}
                    style={{ width: `${Math.min(100, Math.max(2, m.queueSaturationPct))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
