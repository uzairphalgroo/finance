import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Zap,
  Cpu,
  Search
} from 'lucide-react';

interface HowToUseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'manual' | 'terms';
}

interface TermItem {
  id: string;
  term: string;
  category: 'Arbitrage' | 'Network' | 'Order Book' | 'Architecture';
  badge: string;
  formula?: string;
  definition: string;
  importance: string;
}

export const HowToUseGuideModal: React.FC<HowToUseGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'terms'>(initialTab);
  const [termSearch, setTermSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const glossary: TermItem[] = [
    {
      id: 'cross-venue-arb',
      term: 'Cross-Venue Arbitrage',
      category: 'Arbitrage',
      badge: 'Core Concept',
      formula: 'Spread = (Price_sell - Price_buy) / Price_buy',
      definition: 'Simultaneously purchasing a digital asset on one exchange venue where the ask price is low and selling the identical asset on another venue where the bid price is high to lock in risk-free dislocation alpha.',
      importance: 'Exploits structural fragmentation and geographical latency differentials between disparate exchange matching engines.'
    },
    {
      id: 'top-of-book',
      term: 'Top of Book (TOB)',
      category: 'Order Book',
      badge: 'L1 Market Data',
      definition: 'The highest available buy order (Best Bid) and lowest available sell order (Best Ask) currently standing at the top of an exchange order book.',
      importance: 'Serves as the instantaneous baseline for measuring raw bid/ask spreads before walking deep into liquidity tiers.'
    },
    {
      id: 'gross-vs-net',
      term: 'Gross Spread vs. Net Spread',
      category: 'Arbitrage',
      badge: 'P&L Metric',
      formula: 'Net Spread = Gross Spread - Slippage - (TakerFee_buy + TakerFee_sell)',
      definition: 'Gross Spread is the raw percentage price gap between venues. Net Spread is the true realizable economic profit after deducting simulated book slippage and standard maker/taker trading fee tiers.',
      importance: 'A positive gross spread can yield a negative net return if transaction fees and market impact exceed the price dislocation.'
    },
    {
      id: 'actionable-threshold',
      term: 'Actionable Discrepancy Threshold',
      category: 'Arbitrage',
      badge: 'Execution Trigger',
      formula: 'Net Spread (%) > ActionableThresholdPct (Default: 0.15%)',
      definition: 'A configurable hurdle rate (defaulting to 0.15% or 15 bps) above which an arbitrage opportunity is deemed economically viable to overcome tail execution risk.',
      importance: 'Triggers visual laser banners, acoustic synthesizer chimes, and automatic routing recommendations.'
    },
    {
      id: 'slippage-model',
      term: 'Order Book Depth Slippage',
      category: 'Order Book',
      badge: 'Execution Math',
      formula: 'VWAP = Σ(P_i × Q_i) / Σ(Q_i)',
      definition: 'The difference between the expected top-of-book price and the actual volume-weighted average price (VWAP) achieved when executing a large order that sweeps through multiple Level 2 order book levels.',
      importance: 'Prevents unrealistic profit estimations by factoring in order size against available market depth.'
    },
    {
      id: 'packet-jitter',
      term: 'Packet Arrival Jitter (Welford Alg.)',
      category: 'Network',
      badge: 'Telemetry',
      formula: 'M_k = M_{k-1} + (x_k - M_{k-1})/k ; S_k = S_{k-1} + (x_k - M_{k-1})(x_k - M_k)',
      definition: 'The standard deviation of inter-arrival time intervals between consecutive WebSocket market data packets, calculated in real-time using Welford’s single-pass online variance algorithm.',
      importance: 'Measures network queueing stability; jitter spikes indicate ISP packet buffering, TCP congestion, or exchange matching engine delays.'
    },
    {
      id: 'order-book-drift',
      term: 'Order Book Drift',
      category: 'Order Book',
      badge: 'Latency Telemetry',
      formula: 'Drift = SystemLocalTimestamp - ExchangeServerMatchingTimestamp',
      definition: 'The temporal delay between the moment an order book update was serialized by the exchange server and when it was received and processed on the client wire.',
      importance: 'High drift means market signals are stale, increasing the probability of getting front-run or filled at adverse prices.'
    },
    {
      id: 'lock-free-buffer',
      term: 'Lock-Free Circular Ring Buffer',
      category: 'Architecture',
      badge: 'High Performance',
      definition: 'A pre-allocated, fixed-capacity circular memory array with atomic head/tail pointer arithmetic designed to ingest thousands of WebSocket ticks per second with zero garbage collection overhead.',
      importance: 'Guarantees O(1) ingestion without memory allocations, eliminating V8 Garbage Collector pauses during peak volatility spikes.'
    },
    {
      id: 'maker-taker-fee',
      term: 'Maker / Taker Fee (Basis Points)',
      category: 'Arbitrage',
      badge: 'Cost Tier',
      formula: '1 Basis Point (bps) = 0.01% = 0.0001',
      definition: 'Exchange fee structure where "Takers" pay higher fees for immediately removing resting liquidity, while "Makers" pay lower fees or receive rebates for providing passive limit orders.',
      importance: 'Arbitrage legs typically require immediate liquidity consumption on both venues, incurring taker fee tiers.'
    },
    {
      id: 'dark-fiber-rtt',
      term: 'Round-Trip Time (RTT) & Dark Fiber',
      category: 'Network',
      badge: 'Infrastructure',
      definition: 'The total round-trip time required for an ICMP ping or WebSocket heartbeat packet to travel from the terminal to regional exchange data centers (Tokyo, Virginia, Frankfurt).',
      importance: 'Determines the minimum time window required to trigger and execute a 2-leg arbitrage trade before the spread closes.'
    },
  ];

  const filteredGlossary = glossary.filter((g) => {
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    const matchesSearch =
      g.term.toLowerCase().includes(termSearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(termSearch.toLowerCase()) ||
      g.importance.toLowerCase().includes(termSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#08090e] border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden font-mono text-xs text-slate-200">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-black/90 border-b border-white/10">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-tech font-black text-sm sm:text-base text-white tracking-wider">
                  ARBWIRE // GUIDE & GLOSSARY
                </h2>
                <p className="text-[10px] text-slate-400">
                  Operating Instructions & Quantitative Concepts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-all text-center ${
                  activeTab === 'manual'
                    ? 'bg-white text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                HOW TO USE
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold transition-all text-center ${
                  activeTab === 'terms'
                    ? 'bg-white text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GLOSSARY & TERMS
              </button>
            </div>

            <button
              onClick={onClose}
              className="hidden sm:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6">
          {activeTab === 'manual' ? (
            /* Workflow Manual */
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Welcome to Arbwire: Institutional Low-Latency Cross-Venue Arbitrage Matrix</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Arbwire connects simultaneously via zero-proxy public WebSockets directly to <strong>Binance</strong> (Tokyo), <strong>Coinbase</strong> (US Virginia), and <strong>Kraken</strong> (Frankfurt). It continuously computes sub-millisecond Top-of-Book and Level 2 depth divergence, estimates transaction fees and book slippage, and flags actionable cross-venue trading dislocations in real-time.
                </p>
              </div>

              {/* 6 Step Interactive Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Selecting Trading Pairs</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Use the top navigation bar or press keyboard keys <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">1</kbd>, <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">2</kbd>, <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">3</kbd>, or <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">4</kbd> to instantaneously switch between <strong>BTC/USDT</strong>, <strong>ETH/USDT</strong>, <strong>SOL/USDT</strong>, and <strong>AVAX/USDT</strong>. All 3 exchange feeds resubscribe immediately without dropped frames.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Reading the Arbitrage Matrix</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    The Cross-Venue Matrix evaluates all 6 pairwise permutation pathways. It compares <strong>Ask Price on Venue A (Buy Leg)</strong> with <strong>Bid Price on Venue B (Sell Leg)</strong>. It clearly breaks down Gross Spread, simulated slippage, taker fee deductions, and net percentage yield.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Simulating Route Fills &amp; Discrepancy Logging</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    When Net Spread exceeds the threshold (e.g. &gt; 0.15%), an actionable alert illuminates with sound chimes. Click <strong>&ldquo;Simulate Route Fill&rdquo;</strong> to execute a simulated atomic 2-leg order. The trade is captured into the permanent audit trail with full PnL tracking.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Autonomous Discrepancy Snapshot Engine</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Choose an autonomous capture interval (<strong>15s, 30s, 1m, 3m, 5m, 15m</strong>) in the Audit Trail header. When the timer expires, an instantaneous snapshot of the live market order book dislocation is captured autonomously. If you modify the interval, unsaved events are automatically discarded while saved entries and executed trades are preserved. Click <strong>&ldquo;Save All&rdquo;</strong> or the bookmark button to permanently retain snapshots.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <span className="font-bold text-slate-100 text-xs">3D WebGL Spatial Gyroscope</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Interact with the hardware-accelerated 3D Quantum Gyroscope canvas. Click and drag your mouse to rotate the 3D space. Watch the orbiting exchange satellites and the active 3D laser energy beam connect buy and sell execution centers.
                  </p>
                </div>

                {/* Step 6 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center justify-center font-bold text-xs">
                      6
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Analyzing L2 Depth Ladders</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Compare Level 2 depth ladders side-by-side. Visual depth bars illuminate liquidity clustering. Observe inside spreads (in USD and Basis Points) to anticipate market impact before submitting large block sizes.
                  </p>
                </div>

                {/* Step 7 */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 flex items-center justify-center font-bold text-xs">
                      7
                    </span>
                    <span className="font-bold text-slate-100 text-xs">Command Palette &amp; Shortcuts</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">⌘K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Ctrl+K</kbd> at any time to open the Command Interpreter. Type pairs, adjust parameters, export CSV/JSON logs, or toggle audio chimes with zero mouse latency.
                  </p>
                </div>
              </div>

              {/* Keyboard Shortcuts Cheatsheet */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Master Power-User Keyboard Shortcuts</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-black/60 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Open Command Palette</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">⌘K</kbd>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Switch Pairs (1-4)</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">1 - 4</kbd>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Engine Config Modal</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">C</kbd>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400">Mute/Unmute Chimes</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">M</kbd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Glossary & Definitions */
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search terminology (e.g., Jitter, Slippage, TOB, Ring Buffer, Welford)..."
                    value={termSearch}
                    onChange={(e) => setTermSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-white/30 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['ALL', 'Arbitrage', 'Order Book', 'Network', 'Architecture'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-white text-black'
                          : 'bg-black/60 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glossary Cards List */}
              <div className="space-y-3">
                {filteredGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-white/10 hover:border-white/25 transition-all space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-tech font-bold text-sm text-white">
                          {item.term}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 text-slate-300 border border-white/15">
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Category: <strong className="text-slate-200">{item.category}</strong>
                      </span>
                    </div>

                    {item.formula && (
                      <div className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/[0.08] text-[11px] font-mono text-cyan-300">
                        <code>{item.formula}</code>
                      </div>
                    )}

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {item.definition}
                    </p>

                    <div className="text-[11px] text-slate-400 border-t border-white/[0.06] pt-1.5">
                      <strong className="text-slate-200">Why it matters:</strong> {item.importance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-black/90 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Arbwire Quantitative Documentation & Reference Manual</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-slate-200 transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
