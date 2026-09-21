import React, { useState } from 'react';
import { Globe, Server } from 'lucide-react';
import type { ExchangeId, LatencyMetrics } from '../engine/types';

interface VenueTopologyMapProps {
  metrics: Record<ExchangeId, LatencyMetrics>;
}

export const VenueTopologyMap: React.FC<VenueTopologyMapProps> = ({ metrics }) => {
  const [activeVenue, setActiveVenue] = useState<ExchangeId | null>(null);

  const venues: {
    id: ExchangeId;
    name: string;
    city: string;
    region: string;
    coords: { x: number; y: number };
    color: string;
    border: string;
    glow: string;
  }[] = [
    {
      id: 'binance',
      name: 'Binance',
      city: 'Tokyo',
      region: 'AWS ap-northeast-1',
      coords: { x: 82, y: 38 },
      color: 'text-slate-100',
      border: 'border-white/40',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      city: 'Virginia',
      region: 'AWS us-east-1',
      coords: { x: 28, y: 36 },
      color: 'text-slate-100',
      border: 'border-white/40',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
    },
    {
      id: 'kraken',
      name: 'Kraken',
      city: 'Frankfurt',
      region: 'Cloudflare EU-Central',
      coords: { x: 52, y: 28 },
      color: 'text-slate-100',
      border: 'border-white/40',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
    },
  ];

  return (
    <div className="glass-tile rounded-2xl border border-white/10 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 text-white">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-tech font-bold text-sm text-slate-100 tracking-wider">
                CROSS-VENUE FIBER ROUTING TOPOLOGY
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-slate-200 border border-white/15">
                Optical L2 Fabric
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Direct dark-fiber transit routing between global exchange points of presence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Active Photonic Grid
          </span>
        </div>
      </div>

      {/* Interactive Surface */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl bg-[#03050a]/80 border border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:26px_26px]" />

        {/* Clean Monochromatic SVG Laser Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="laserGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="laserGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Virginia to Frankfurt */}
          <path
            d="M 28 36 Q 40 16 52 28"
            fill="none"
            stroke="url(#laserGrad1)"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            className="opacity-70 animate-pulse"
          />

          {/* Frankfurt to Tokyo */}
          <path
            d="M 52 28 Q 66 12 82 38"
            fill="none"
            stroke="url(#laserGrad2)"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            className="opacity-70 animate-pulse"
          />

          {/* Trans-Pacific Virginia to Tokyo */}
          <path
            d="M 28 36 Q 55 64 82 38"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1.0"
            strokeDasharray="2 3"
          />

          {/* Photonic Energy Sparks */}
          <circle r="1.8" fill="#ffffff">
            <animateMotion path="M 28 36 Q 40 16 52 28" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle r="1.8" fill="#10b981">
            <animateMotion path="M 52 28 Q 66 12 82 38" dur="3.0s" repeatCount="indefinite" />
          </circle>
          <circle r="1.8" fill="#ffffff">
            <animateMotion path="M 82 38 Q 55 64 28 36" dur="3.8s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* 3D Venue Nodes */}
        {venues.map((v) => {
          const m = metrics[v.id];
          const isHovered = activeVenue === v.id;

          return (
            <div
              key={v.id}
              style={{ left: `${v.coords.x}%`, top: `${v.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onMouseEnter={() => setActiveVenue(v.id)}
              onMouseLeave={() => setActiveVenue(null)}
            >
              {/* Radial Signal Wave Pulse */}
              <div className={`absolute -inset-4 rounded-full border ${v.border} animate-signal-wave pointer-events-none opacity-40`} />

              {/* Node Center Dot */}
              <div
                className={`relative flex items-center justify-center w-9 h-9 rounded-2xl bg-black/95 border ${
                  v.border
                } ${v.glow} transition-all duration-300 group-hover:scale-110`}
              >
                <Server className={`w-4 h-4 ${v.color}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* Node Label Below */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                <div className={`text-xs font-mono font-black ${v.color}`}>
                  {v.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {v.city} ({m ? `${m.pingRttMs.toFixed(0)}ms` : '—'})
                </div>
              </div>

              {/* Hover Telemetry Card */}
              {isHovered && m && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-52 p-3.5 rounded-2xl bg-black/95 border border-white/20 backdrop-blur-2xl shadow-2xl z-30 font-mono text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-bold text-white">{v.name}</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold">{m.connectionState}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Ping RTT:</span>
                    <span className="font-mono-nums font-black text-emerald-400">{m.pingRttMs.toFixed(1)} ms</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Arrival Jitter:</span>
                    <span className="font-mono-nums font-bold text-slate-200">{m.packetJitterMs.toFixed(2)} ms</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Message Rate:</span>
                    <span className="font-mono-nums font-bold text-slate-200">{m.msgPerSecond} msg/s</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                    {v.region}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
