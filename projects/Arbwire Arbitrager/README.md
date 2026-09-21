# Arbwire Quantum ⚡ Institutional Quantitative Arbitrage & Spatial Telemetry Suite

Arbwire is an open-source, high-performance quantitative workstation engineered for real-time cryptocurrency cross-venue arbitrage detection, microstructural order book analytics (VPIN / OBI), triangular arbitrage execution routing, and sub-millisecond network latency telemetry across Binance, Coinbase, and Kraken.

---

> [!IMPORTANT]
> **Open Source & Non-Liability Disclaimer**:
> Arbwire is an open-source educational and quantitative research project distributed under the MIT License. The developers, maintainers, and contributors **are not responsible for any misuse, financial loss, trading errors, network outages, or problems** arising from the use or deployment of this software. All simulated route fills and metrics are provided strictly on an **"AS IS"** research basis without warranties of any kind.

---

## 🚀 Key Modules & Architecture

### 1. Direct Multi-Venue Public Market Data Stream
- **Zero Authentication Required**: Connects directly via client-side WebSockets to public L2 order book feeds:
  - **Binance**: `wss://stream.binance.com:9443/ws/<pair>@depth20@100ms`
  - **Coinbase**: `wss://ws-feed.exchange.coinbase.com` (`level2_batch`)
  - **Kraken**: `wss://ws.kraken.com/v2` (`book` depth 25)
- **Bounded Lock-Free Ring Buffer**: Memory-safe circular queue buffers bursts of volatility to prevent Garbage Collection (GC) pauses and memory leaks.
- **Micro-Batched Render Loop**: High-frequency updates are dispatched cleanly inside a 60FPS `requestAnimationFrame` render pump to eliminate React DOM thrashing.

### 2. Quantitative Arbitrage Engine
- **Pairwise Spread Matrix**: Computes instantaneous Top-of-Book and VWAP-adjusted cross-venue spreads in real time.
- **VWAP Depth Slippage**: Simulates walking the true L2 order book depth for user-defined notional block sizes ($1,000 to $100,000+).
- **Fee Optimization**: Configurable taker/maker basis point (bps) fee tiers per exchange.
- **Actionable Threshold Filter**: Triggers visual indicators and optional acoustic harmonic chimes when Net Spread exceeds the user-configured actionable threshold (e.g. `> 0.15%`).
- **Simulated 2-Leg Route Fill**: One-click simulated trade execution with real-time PnL tracking and execution logging.

### 3. Discrepancy Capture Audit Trail
- **Autonomous Periodic Snapshots**: Configurable autonomous snapshot intervals (**15s, 30s, 1m, 3m, 5m, 15m**, or Manual).
- **Instantaneous Snapshot at Interval**: Automatically freezes and records the exact order book dislocation state at the scheduled second.
- **Dynamic Unsaved Purge**: Modifying the interval in between automatically cleans up unsaved autonomous snapshots, keeping the journal pristine.
- **One-Click Persistence & Export**: Bookmark individual snapshots, "Save All", or export full audit logs to **CSV / JSON**.

### 4. 3D WebGL Spatial Gyroscope
- **Interactive 3-Axis Gimbal System**: Yaw, Pitch, and Roll metallic rings with butter-smooth inertia damping and touch support.
- **Holographic Celestial Globe**: High-resolution procedural canvas textures with latitude/longitude coordinate grids, glowing equator, and circuit node pathways.
- **Venue Satellites**: Color-coded metallic planetary nodes (Binance Gold, Coinbase Royal Blue, Kraken Neon Purple) with orbiting energy halos.
- **Visual Skin Themes**: Instant theme switching between **Quantum Emerald**, **Cyberpunk Neon**, **Solar Plasma**, and **Deep Space Matrix**.
- **Volumetric Laser Vector**: Glowing energy laser beam with traveling pulse particles linking Buy and Sell execution venues.

### 5. Microstructure Alpha & Triangular Cycles
- **Order Book Imbalance (OBI)**: Evaluates Top-5 and Top-10 bid/ask depth skew to predict directional pressure.
- **Toxicity Index (VPIN)**: Volume-Synchronized Probability of Toxicity estimation.
- **Triangular Arbitrage Scanner**: Scans cyclic routes (e.g., BTC $\rightarrow$ ETH $\rightarrow$ SOL $\rightarrow$ USDT) for cyclic exchange arbitrage dislocations.

### 6. Sub-Millisecond Network Latency Telemetry
- **Round-Trip Time (RTT)**: Live WebSocket ping/pong latency tracking with min, avg, and max gauges.
- **Welford's Algorithm Jitter**: Computes online inter-packet arrival time variance in $O(1)$ space.
- **Clock Drift & Message Velocity**: Monotonic vs. server timestamp discrepancy and messages-per-second throughput counters.

---

## 📊 Mathematical Formulations

### 1. Volume-Weighted Average Price (VWAP) Slippage
For a target order size $S_{\text{USD}}$, we compute the effective fill price across order book levels $i = 1 \dots k$:

$$\text{VWAP} = \frac{\sum_{i=1}^{k} P_i \cdot Q_i}{\sum_{i=1}^{k} Q_i}$$

$$\text{Slippage}_{\text{buy}} (\%) = \frac{\text{VWAP}_{\text{ask}} - P_{\text{top ask}}}{P_{\text{top ask}}} \times 100$$

$$\text{Slippage}_{\text{sell}} (\%) = \frac{P_{\text{top bid}} - \text{VWAP}_{\text{bid}}}{P_{\text{top bid}}} \times 100$$

### 2. Net Arbitrage Spread
$$\text{Effective Buy Price} = \text{VWAP}_{\text{ask}} \times \left(1 + \frac{\text{Fee}_{\text{buy (bps)}}}{10000}\right)$$

$$\text{Effective Sell Price} = \text{VWAP}_{\text{bid}} \times \left(1 - \frac{\text{Fee}_{\text{sell (bps)}}}{10000}\right)$$

$$\text{Net Spread} (\%) = \frac{\text{Effective Sell Price} - \text{Effective Buy Price}}{\text{Effective Buy Price}} \times 100$$

$$\text{Actionable Alert Condition}: \quad \text{Net Spread} \ge \text{Threshold} \quad (\text{Default: } 0.15\%)$$

### 3. Welford's Algorithm for Packet Arrival Jitter
Given inter-arrival intervals $x_k = t_k - t_{k-1}$:

$$M_k = M_{k-1} + \frac{x_k - M_{k-1}}{k}$$

$$S_k = S_{k-1} + (x_k - M_{k-1})(x_k - M_k)$$

$$\sigma = \sqrt{\frac{S_k}{k - 1}}$$

---

## 🛠️ Quickstart

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/uzairphalgroo/finance.git

# Navigate to the project directory
cd "finance/projects/Arbwire Arbitrager"

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Unit Tests
```bash
npm test
```

### Build Production Bundle
```bash
npm run build
```

---

## ⌨️ Power-User Keyboard Shortcuts

| Key Shortcut | Action |
|:---|:---|
| <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> | Open Power-User Command Interpreter |
| <kbd>1</kbd> - <kbd>4</kbd> | Quick Switch Active Trading Pairs (BTC, ETH, SOL, AVAX) |
| <kbd>C</kbd> | Open Engine Configuration & Fee Presets Modal |
| <kbd>M</kbd> | Toggle Acoustic Audio Synthesis Chimes |
| <kbd>A</kbd> | Toggle OpenRouter AI Quant Copilot Slide-out Drawer |
| <kbd>G</kbd> / <kbd>?</kbd> | Open Interactive User Manual & Quantitative Glossary |

---

## 📁 Repository Structure

```
Arbwire Arbitrager/
├── src/
│   ├── analytics/
│   │   ├── ArbitrageEngine.ts        # VWAP slippage & net spread matrix
│   │   ├── AutoExecutionBot.ts       # Autonomous trade execution simulator
│   │   ├── LatencyMonitor.ts         # Welford packet jitter & RTT telemetry
│   │   ├── MicrostructureEngine.ts   # Order Book Imbalance (OBI) & VPIN toxicity
│   │   ├── TriangularArbitrageEngine.ts # 3-leg cyclic arbitrage discovery
│   │   └── __tests__/                # Vitest unit test suites
│   ├── components/
│   │   ├── AiQuantCopilotDrawer.tsx  # OpenRouter AI Quant Copilot drawer
│   │   ├── ArbitrageMatrix.tsx       # Heatmap matrix & 1-click execution router
│   │   ├── AutoTradingBotPanel.tsx   # Autonomous bot status & equity curves
│   │   ├── CommandPalette.tsx        # Zero-latency command interpreter
│   │   ├── ConfigModal.tsx           # Parameters & fee customization modal
│   │   ├── GlobalMosaicView.tsx      # Multi-asset multi-venue mosaic view
│   │   ├── Header.tsx                # Status pills, ticker selector, live clock
│   │   ├── HowToUseGuideModal.tsx    # Comprehensive user guide & glossary
│   │   ├── LatencyTelemetryPanel.tsx # RTT, jitter, and drift telemetry dials
│   │   ├── MicrostructureAlphaPanel.tsx # OBI gauges & VPIN toxicity meters
│   │   ├── OpportunityLog.tsx        # Discrepancy capture audit trail & exporter
│   │   ├── OrderBookDepth.tsx        # Dual L2 depth ladders with liquidity bars
│   │   ├── SpreadHistoryChart.tsx    # Real-time 60FPS spread history canvas
│   │   ├── ThreeDArbitrageOrb.tsx    # 3D WebGL Spatial Gyroscope with visual skins
│   │   └── TriangularArbitragePanel.tsx # Triangular routes & execution panel
│   ├── engine/
│   │   ├── exchanges/
│   │   │   ├── BinanceFeed.ts        # Public Binance WebSocket client
│   │   │   ├── CoinbaseFeed.ts       # Public Coinbase Level 2 WebSocket client
│   │   │   └── KrakenFeed.ts         # Public Kraken v2 Book WebSocket client
│   │   ├── FeedManager.ts            # Feed orchestrator & RAF dispatch loop
│   │   ├── RingBuffer.ts             # Lock-free circular bounded queue
│   │   └── types.ts                  # TypeScript quantitative domain types
│   ├── services/
│   │   ├── AiQuantCopilot.ts         # OpenRouter AI model integration
│   │   └── SoundFx.ts                # Web Audio API harmonic synthesizer
│   ├── App.tsx                       # Main Terminal layout & View state switcher
│   ├── index.css                     # Tailwind CSS tokens & institutional theme
│   └── main.tsx                      # Vite React entrypoint
├── LICENSE                           # Open Source MIT License with Disclaimer
├── PRIVACY.md                        # Client-side Privacy Policy
├── TERMS.md                          # Terms of Service & Limitation of Liability
├── SECURITY.md                       # Security Policy & Vulnerability Reporting
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License & Open-Source Policy

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full legal text.

**Disclaimer**: Arbwire is an open-source educational project. The creators and contributors are not responsible for any misuse, financial losses, or trading errors.
