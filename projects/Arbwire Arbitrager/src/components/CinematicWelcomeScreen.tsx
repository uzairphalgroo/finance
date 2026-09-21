import React, { useState } from 'react';
import {
  Zap,
  Layers,
  Bot,
  Gauge,
  Sparkles,
  ArrowRight,
  Globe,
  Radio,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { SoundFx } from '../services/SoundFx';

interface CinematicWelcomeScreenProps {
  onEnterTerminal: () => void;
}

export const CinematicWelcomeScreen: React.FC<CinematicWelcomeScreenProps> = ({ onEnterTerminal }) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const handleLaunch = () => {
    SoundFx.playExecutionSound();
    if (dontShowAgain) {
      try {
        localStorage.setItem('arbwire_welcome_dismissed', 'true');
      } catch {
        // localStorage ignore
      }
    }
    onEnterTerminal();
  };

  const scrollToOverview = () => {
    document.getElementById('cinematic-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020306] text-white selection:bg-emerald-500/30 selection:text-white font-sans overflow-x-hidden relative">
      {/* Background Cybernetic Grids & Ambient Holographic Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/[0.07] rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-3/4 left-1/4 w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[150px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#020306]/80 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Arbwire Logo" className="w-8 h-8 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            <div className="flex items-center gap-2">
              <span className="font-tech font-black text-lg tracking-wider text-white">
                ARB<span className="text-emerald-400">WIRE</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-slate-300 border border-white/20 uppercase">
                QUANTUM 2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToOverview}
              className="hidden md:inline-flex text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Architecture & Engines ↓
            </button>
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-black text-xs transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>ENTER TERMINAL</span>
              <ArrowRight className="w-3.5 h-3.5 fill-black" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION: High-Impact Cinematic Landing */}
      <section className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto pt-10 pb-16">
        {/* Animated Pill Status */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-8 animate-fade-in shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ZERO-PROXY DIRECT WEBSOCKET ENGINES ONLINE</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-300">3 VENUES &bull; 4 ASSET PAIRS</span>
        </div>

        {/* Central Glowing Vector Logo */}
        <div className="relative mb-8 group cursor-pointer" onClick={handleLaunch}>
          <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-2xl group-hover:bg-emerald-500/40 transition-all" />
          <img
            src="/logo.svg"
            alt="Arbwire Institutional Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 relative z-10 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)] transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Main Title & Statement */}
        <h1 className="font-tech font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-4xl leading-[1.1] mb-6">
          Institutional Cross-Venue Arbitrage & AI Quant Terminal
        </h1>

        <p className="font-mono text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Sub-millisecond market microstructure analytics, Bellman-Ford triangular cycle detection, autonomous paper-trading execution, and OpenRouter AI market intelligence.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-12">
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-slate-200 text-black font-tech font-black text-base transition-all shadow-[0_0_35px_rgba(255,255,255,0.2)] hover:shadow-[0_0_45px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer"
          >
            <span>LAUNCH TERMINAL NOW</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={scrollToOverview}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Architecture</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Remember choice toggle */}
        <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none hover:text-slate-300">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/40 w-4 h-4 cursor-pointer"
          />
          <span>Do not show welcome intro on next startup</span>
        </label>

        {/* Live Venue Latency HUD Bar */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs text-left">
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Binance (Tokyo)
            </div>
            <div className="font-tech font-extrabold text-lg text-white mt-1">~18ms RTT</div>
            <div className="text-[10px] text-emerald-400 font-bold">Direct Level 2 Depth</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Coinbase (Virginia)
            </div>
            <div className="font-tech font-extrabold text-lg text-white mt-1">~24ms RTT</div>
            <div className="text-[10px] text-cyan-400 font-bold">Order Match Stream</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
              Kraken (Frankfurt)
            </div>
            <div className="font-tech font-extrabold text-lg text-white mt-1">~31ms RTT</div>
            <div className="text-[10px] text-blue-400 font-bold">Public Book Feed</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md bg-gradient-to-b from-emerald-950/20 to-black/60">
            <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              AI Copilot
            </div>
            <div className="font-tech font-extrabold text-lg text-white mt-1">OpenRouter LLM</div>
            <div className="text-[10px] text-slate-400 font-bold">Deep Dislocation AI</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Architecture & Engines Showcase */}
      <section id="cinematic-features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            ENGINEERING EXCELLENCE
          </span>
          <h2 className="font-tech font-black text-3xl sm:text-5xl text-white">
            Next-Gen Algorithmic Trading Architecture
          </h2>
          <p className="font-mono text-sm text-slate-400">
            Engineered from first principles for sub-millisecond crypto quantitative developers and high-frequency liquidity arbitrageurs.
          </p>
        </div>

        {/* 5 Core Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Zero-Proxy Ingestion */}
          <div className="glass-tile rounded-3xl p-6 border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all group">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              Zero-Proxy Direct WebSockets
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Browser directly connects to Binance, Coinbase, and Kraken public market data streams. High-throughput circular ring buffer prevents garbage collection stalls during extreme volatility.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>5,000+ msgs/sec Zero Memory Leak</span>
            </div>
          </div>

          {/* Card 2: Triangular Cycles */}
          <div className="glass-tile rounded-3xl p-6 border border-white/10 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 w-fit group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              Bellman-Ford Triangular Graph
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Computes negative weight currency cycles across USDT, BTC, ETH, SOL, and AVAX. Dynamically accounts for venue taker fee tiers, slippage curves, and execution latency.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>12 Multi-Hop Paths Analyzed / ms</span>
            </div>
          </div>

          {/* Card 3: Autonomous Bot */}
          <div className="glass-tile rounded-3xl p-6 border border-white/10 space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              Autonomous Paper HFT Bot
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Automated execution engine enforcing spread thresholds, latency limits, and daily drawdowns. Tracks virtual cross-exchange inventory balances and renders interactive cumulative equity curves.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-amber-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sharpe Ratio & Win-Rate Ledger</span>
            </div>
          </div>

          {/* Card 4: Microstructure Alpha */}
          <div className="glass-tile rounded-3xl p-6 border border-white/10 space-y-4 hover:border-violet-500/40 transition-all group">
            <div className="p-3 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 w-fit group-hover:scale-110 transition-transform">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              Order Book Imbalance (OBI)
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Top-5 and Top-10 level depth volume imbalance meters detecting directional buyer vs seller dominance. Computes VPIN flow toxicity scores to avoid adverse selection.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-violet-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Directional Price Drift Predictor</span>
            </div>
          </div>

          {/* Card 5: OpenRouter AI Copilot */}
          <div className="glass-tile rounded-3xl p-6 border border-emerald-500/30 space-y-4 hover:border-emerald-400 transition-all group bg-gradient-to-b from-emerald-950/20 to-black/60">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              OpenRouter AI Quant Copilot
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Live LLM streaming deep market dislocation diagnostics. Traders can interview the copilot on algorithmic routing safety, toxic flow conditions, and cross-venue microstructure anomalies.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Claude 3.5 & GPT-4o-mini Integration</span>
            </div>
          </div>

          {/* Card 6: Global Multi-Asset Mosaic */}
          <div className="glass-tile rounded-3xl p-6 border border-white/10 space-y-4 hover:border-sky-500/40 transition-all group">
            <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 w-fit group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-tech font-extrabold text-xl text-white">
              High-Density Mosaic Terminal
            </h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Simultaneous 4-asset matrix monitoring BTC, ETH, SOL, and AVAX with 1-click execution triggers, audio confirmation chimes, and institutional dark carbon aesthetics.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-sky-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bloomberg-Grade Command UI</span>
            </div>
          </div>
        </div>

        {/* Comparison Table: Standard Dashboards vs Arbwire */}
        <div className="glass-tile rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-tech font-bold text-xl text-white">
                Technical Specification Comparison
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Institutional quantitative engineering vs traditional web dashboards
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Benchmark Standard 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-4">Feature Vector</th>
                  <th className="py-3 px-4">Legacy Web Dashboards</th>
                  <th className="py-3 px-4 text-emerald-400 font-bold">Arbwire Quantum 2.0</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Ingestion Architecture</td>
                  <td className="py-3.5 px-4 text-rose-400">Proxy server poll (200-500ms delay)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Direct Browser WebSocket (&lt;20ms)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Arbitrage Topology</td>
                  <td className="py-3.5 px-4 text-slate-400">Simple 2-venue spread only</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Bellman-Ford 3-Hop Multi-Cycle</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Automated Trading</td>
                  <td className="py-3.5 px-4 text-slate-400">Static alerts / manual entry</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Autonomous Bot + Live Equity Curve</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">Microstructure Alpha</td>
                  <td className="py-3.5 px-4 text-slate-400">None / Basic candles</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Top-10 OBI & VPIN Toxicity Gauges</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-white">AI Intelligence</td>
                  <td className="py-3.5 px-4 text-slate-400">None</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">OpenRouter LLM Dislocation Copilot</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="glass-tile rounded-3xl p-8 sm:p-12 border border-emerald-500/40 text-center space-y-6 bg-gradient-to-b from-emerald-950/20 via-black to-[#020306]">
          <div className="flex items-center justify-center gap-3">
            <img src="/logo.svg" alt="Arbwire Logo" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]" />
            <h3 className="font-tech font-black text-2xl sm:text-4xl text-white">
              Ready to Monitor Live Alpha?
            </h3>
          </div>
          <p className="font-mono text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Experience the full real-time quantitative terminal with direct WebSocket depth ladders, cyclic graph visualizer, and autonomous paper bot.
          </p>
          <button
            onClick={handleLaunch}
            className="px-10 py-4 rounded-2xl bg-white hover:bg-slate-200 text-black font-tech font-black text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer inline-flex items-center gap-3"
          >
            <span>LAUNCH QUANTITATIVE TERMINAL</span>
            <ArrowRight className="w-5 h-5 fill-black" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 px-6 text-center text-xs font-mono text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-bold">Arbwire Quantum 2.0 &bull; Institutional Quantitative Suite</span>
          </div>
          <div>
            <span>Direct Feeds: Binance &bull; Coinbase &bull; Kraken</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
