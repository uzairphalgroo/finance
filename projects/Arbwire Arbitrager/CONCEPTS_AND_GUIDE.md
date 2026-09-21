# Quantitative Arbitrage, Microstructure & Low-Latency Systems: Comprehensive Concepts & Field Guide

> [!IMPORTANT]
> **Open Source & Educational Disclaimer**:
> Arbwire is an open-source quantitative research, telemetry, and simulation tool. This document is written purely for educational and scientific purposes. The authors, maintainers, and open-source contributors **are not responsible for any misuse, financial loss, trading errors, system bugs, or liquidation problems** resulting from applying these concepts or running this software.

---

## Table of Contents
1. [Core Arbitrage Mechanics & Dislocation Models](#1-core-arbitrage-mechanics--dislocation-models)
   - [Spatial 2-Leg Cross-Venue Arbitrage](#spatial-2-leg-cross-venue-arbitrage)
   - [Triangular & Cyclic Multi-Hop Arbitrage](#triangular--cyclic-multi-hop-arbitrage)
   - [Top-of-Book (TOB) vs. Volume-Weighted Average Price (VWAP)](#top-of-book-tob-vs-volume-weighted-average-price-vwap)
   - [Exchange Fee Presets & Basis Point (bps) Economics](#exchange-fee-presets--basis-point-bps-economics)
2. [Market Microstructure & Order Flow Analytics](#2-market-microstructure--order-flow-analytics)
   - [Order Book Imbalance (OBI) & Directional Pressure](#order-book-imbalance-obi--directional-pressure)
   - [Volume-Synchronized Probability of Toxicity (VPIN)](#volume-synchronized-probability-of-toxicity-vpin)
   - [Spread Anatomy: Gross, Inside, Effective, and Net Spreads](#spread-anatomy-gross-inside-effective-and-net-spreads)
   - [Adverse Selection & Execution Horizon](#adverse-selection--execution-horizon)
3. [Network Physics, Latency Telemetry & High-Frequency Architecture](#3-network-physics-latency-telemetry--high-frequency-architecture)
   - [Round-Trip Time (RTT) & Monotonic Clock Drift](#round-trip-time-rtt--monotonic-clock-drift)
   - [Packet Arrival Jitter via Welford’s Algorithm](#packet-arrival-jitter-via-welfords-algorithm)
   - [Lock-Free Bounded Ring Buffers & Backpressure Safety](#lock-free-bounded-ring-buffers--backpressure-safety)
   - [Micro-Batched UI Render Loops](#micro-batched-ui-render-loops)
4. [Autonomous Discrepancy Snapshot & Audit Trails](#4-autonomous-discrepancy-snapshot--audit-trails)
   - [Interval-Based Snapshots (15s, 30s, 1m, 3m, 5m, 15m)](#interval-based-snapshots-15s-30s-1m-3m-5m-15m)
   - [Unsaved Snapshot Purging Logic](#unsaved-snapshot-purging-logic)
   - [Audit Compliance & Post-Trade Reconciliation](#audit-compliance--post-trade-reconciliation)
5. [Complete Mathematical Formulation Cheatsheet](#5-complete-mathematical-formulation-cheatsheet)
6. [Master Quantitative Glossary (A to Z)](#6-master-quantitative-glossary-a-to-z)

---

## 1. Core Arbitrage Mechanics & Dislocation Models

### Spatial 2-Leg Cross-Venue Arbitrage
Spatial arbitrage exploits temporary pricing discrepancies for the exact same asset across geographically dispersed matching engines. In cryptocurrency markets, exchange matching engines operate independently without a consolidated national market system (such as the US Equity Reg NMS NBBO).

```
   [ Venue A (e.g. Binance) ]                      [ Venue B (e.g. Coinbase) ]
      Best Ask: $64,100.00                            Best Bid: $64,220.00
               │                                               │
               └───► BUY 1.0 BTC ────────► SELL 1.0 BTC ───────┘
                     Cost: $64,100.00      Revenue: $64,220.00
                     Gross Dislocation: +$120.00 (+0.187%)
```

When the **Best Ask** on Venue A is lower than the **Best Bid** on Venue B after deducting exchange taker fees and expected slippage, a positive net economic opportunity exists.

---

### Triangular & Cyclic Multi-Hop Arbitrage
Triangular arbitrage occurs within three currency pairs (either on a single venue or across multiple venues), forming a closed topological loop:

$$\text{Base Asset} \xrightarrow{\text{Hop 1}} \text{Quote Asset A} \xrightarrow{\text{Hop 2}} \text{Quote Asset B} \xrightarrow{\text{Hop 3}} \text{Base Asset}$$

Example Cyclic Path:
$$\text{USDT} \xrightarrow{\text{Buy BTC}} \text{BTC} \xrightarrow{\text{Buy ETH}} \text{ETH} \xrightarrow{\text{Sell for USDT}} \text{USDT}$$

If the compounded cross-rate product $\prod_{i=1}^{3} R_i$ exceeds $1.0$ by more than the cumulative trading fees $\sum \text{Fee}_i$, an instantaneous cyclic arbitrage exists.

---

### Top-of-Book (TOB) vs. Volume-Weighted Average Price (VWAP)
- **Top-of-Book (TOB)** represents only the best level-1 price quote (Best Bid and Best Ask). TOB is often deceptive because available liquidity at level 1 might be only $\$500$, making large orders incur heavy slippage.
- **VWAP Depth Slippage**: Arbwire simulates walking through consecutive price levels of the L2 order book ladder until the full target notional order size ($S_{\text{USD}}$, e.g. $\$10,000$) is completely satisfied:

$$\text{VWAP}_{\text{ask}} = \frac{\sum_{i=1}^{k} P_i \cdot Q_i}{\sum_{i=1}^{k} Q_i}$$

Where $\sum_{i=1}^{k} P_i \cdot Q_i = S_{\text{USD}}$.

---

### Exchange Fee Presets & Basis Point (bps) Economics
A **basis point (bps)** represents one hundredth of a percentage point ($1 \text{ bps} = 0.01\% = 0.0001$).
In high-frequency quantitative systems:
- **Taker Fees**: Paid by aggressive orders that remove liquidity from the order book (typically 2 to 6 bps on institutional tiers).
- **Maker Fees**: Paid by passive limit orders resting on the book (often 0 to 2 bps or negative maker rebates).

**Effective Net Spread Equation**:
$$\text{Net Spread } (\%) = \left( \frac{\text{VWAP}_{\text{sell}} \times (1 - \text{Fee}_{\text{sell}})}{\text{VWAP}_{\text{buy}} \times (1 + \text{Fee}_{\text{buy}})} - 1 \right) \times 100$$

---

## 2. Market Microstructure & Order Flow Analytics

### Order Book Imbalance (OBI) & Directional Pressure
Order Book Imbalance measures the relative depth imbalance between the bid side and the ask side across the top $N$ levels of the order book:

$$\text{OBI}_N = \frac{\text{Depth}_{\text{bid}, N} - \text{Depth}_{\text{ask}, N}}{\text{Depth}_{\text{bid}, N} + \text{Depth}_{\text{ask}, N}} \in [-1.0, +1.0]$$

- $\text{OBI} \approx +1.0$: Strong buying support / bid wall $\rightarrow$ **BULLISH** pressure.
- $\text{OBI} \approx -1.0$: Heavy selling overhead / ask wall $\rightarrow$ **BEARISH** pressure.
- $\text{OBI} \approx 0.0$: Symmetrical two-sided liquidity $\rightarrow$ **NEUTRAL**.

---

### Volume-Synchronized Probability of Toxicity (VPIN)
VPIN evaluates whether incoming order flow is informed (toxic) vs. uninformed (noise trading). When large informed institutional orders sweep through the book, market makers widen their spreads or cancel quotes to prevent adverse selection.

$$\text{VPIN} = \frac{\sum_{\tau=1}^{V} |V_\tau^{\text{buy}} - V_\tau^{\text{sell}}|}{V \times \text{Total Volume}}$$

High VPIN ($>0.70$) indicates an imminent volatility breakout or toxic spread expansion.

---

### Spread Anatomy
1. **Inside (Touch) Spread**: Difference between Best Ask and Best Bid on a single venue ($P_{\text{ask}} - P_{\text{bid}}$).
2. **Gross Cross-Venue Spread**: Spread between Highest Bid on Venue A and Lowest Ask on Venue B before fees.
3. **Net Spread**: Final realized profit margin after deducting taker fees, slippage, and estimated route latency penalty.

---

### Adverse Selection & Execution Horizon
Adverse selection occurs when a trade is filled just before the market moves against the trader. If exchange latency is $30\text{ms}$ but the dislocation lifetime is only $12\text{ms}$, the second leg may fill at a degraded price, turning a theoretical profit into a realized loss.

---

## 3. Network Physics, Latency Telemetry & High-Frequency Architecture

### Round-Trip Time (RTT) & Monotonic Clock Drift
- **WebSocket RTT**: Time required for a ping packet to travel to the exchange server and return as pong.
- **Clock Drift**: Discrepancy between the timestamp generated by the exchange matching engine and the local monotonic client clock ($t_{\text{local}} - t_{\text{exchange}}$). Large drift indicates queuing delays or clock de-synchronization.

---

### Packet Arrival Jitter via Welford’s Algorithm
Network jitter is the variance in inter-arrival times between consecutive market depth updates. Traditional sample variance requires two passes over the data or unbounded memory buffers. 

Arbwire uses **Welford’s single-pass online recurrence relation** in $O(1)$ space and $O(1)$ time:

$$M_k = M_{k-1} + \frac{x_k - M_{k-1}}{k}$$
$$S_k = S_{k-1} + (x_k - M_{k-1})(x_k - M_k)$$
$$\sigma = \sqrt{\frac{S_k}{k - 1}}$$

Where $x_k = t_k - t_{k-1}$ is the arrival delta between packet $k$ and packet $k-1$.

---

### Lock-Free Bounded Ring Buffers & Backpressure Safety
During high-frequency market bursts, WebSocket feeds can deliver 1,000+ depth deltas per second. Unbounded arrays cause continuous memory reallocation, high GC pauses, and UI lockups.

Arbwire deploys a **Fixed-Capacity Circular Ring Buffer**:
- Pre-allocated TypedArray in contiguous memory.
- $O(1)$ push and $O(1)$ drain operations.
- Overwrites oldest entries on saturation, guaranteeing zero memory leaks.

---

### Micro-Batched UI Render Loops
React re-renders on every incoming WebSocket tick would throttle the JavaScript thread. Arbwire isolates raw streaming data inside high-speed refs and synchronizes with the browser's hardware refresh rate using `requestAnimationFrame` micro-batches at a smooth 60–120 FPS.

---

## 4. Autonomous Discrepancy Snapshot & Audit Trails

### Interval-Based Snapshots (15s, 30s, 1m, 3m, 5m, 15m)
Users can activate autonomous periodic snapshotting to record instantaneous market dislocation profiles at fixed intervals without manual clicking.

```
 Timer Starts (e.g. 30s) ──► Countdown (00:29... 00:01) ──► Interval Elapses 
                                                                  │
                                                                  ▼
 [ Live Order Book Dislocation ] ──► Instantaneous Capture ──► Recorded to Audit Trail
                                                                  │
                                 ◄── Timer Resets for Next Cycle ─┘
```

---

### Unsaved Snapshot Purging Logic
To prevent stale uncommitted records from polluting the journal, changing the interval parameter in between automatically purges any unpersisted autonomous entries, while permanently preserved (`SAVED`) entries and simulated route fills (`EXECUTED`) remain protected.

---

### Audit Compliance & Post-Trade Reconciliation
Exported audit logs provide full chronological traceability including:
- High-precision timestamp (ISO 8601 + epoch ms)
- Routing pathway (Buy exchange $\rightarrow$ Sell exchange)
- Leg prices, slippage %, fees in bps, net spread, and simulated net profit in USD.

---

## 5. Complete Mathematical Formulation Cheatsheet

| Parameter | Formula | Purpose |
|:---|:---|:---|
| **VWAP** | $\frac{\sum P_i \cdot Q_i}{\sum Q_i}$ | True depth fill price |
| **Buy Slippage** | $\frac{\text{VWAP}_{\text{ask}} - P_{\text{top ask}}}{P_{\text{top ask}}} \times 100$ | Depth penalty on Buy |
| **Sell Slippage** | $\frac{P_{\text{top bid}} - \text{VWAP}_{\text{bid}}}{P_{\text{top bid}}} \times 100$ | Depth penalty on Sell |
| **Net Spread** | $\frac{\text{Eff. Sell} - \text{Eff. Buy}}{\text{Eff. Buy}} \times 100$ | Clean profit margin % |
| **OBI** | $\frac{\text{Depth}_{\text{bid}} - \text{Depth}_{\text{ask}}}{\text{Depth}_{\text{bid}} + \text{Depth}_{\text{ask}}}$ | Order book depth skew |
| **Welford Variance** | $S_k = S_{k-1} + (x_k - M_{k-1})(x_k - M_k)$ | $O(1)$ packet arrival jitter |
| **Jitter StDev** | $\sigma = \sqrt{\frac{S_k}{k - 1}}$ | Network consistency metric |
| **Exponential Backoff** | $\min(16\text{s}, 1.0\text{s} \times 1.6^n) + \text{jitter}$ | Reconnection safety |

---

## 6. Master Quantitative Glossary (A to Z)

- **Actionable Opportunity**: A market spread that exceeds the minimum required profit threshold after deducting all slippage and fees (e.g. $>0.15\%$).
- **Adverse Selection**: The risk that an order is filled only when prices are moving in the opposite direction.
- **Basis Point (bps)**: A unit equal to $0.01\%$ or $0.0001$.
- **Circuit Breaker**: An automated safety mechanism that halts order routing when latency or volatility exceeds safe limits.
- **Clock Drift**: Difference between server timestamp and client local monotonic clock.
- **Depth Ladder**: Step-by-step table displaying bid and ask liquidity levels of an exchange order book.
- **Gross Spread**: Price difference before deducting exchange fees and execution slippage.
- **Jitter**: High-frequency variation in packet delivery arrival times.
- **Lock-Free Ring Buffer**: A circular queue with fixed memory allocation that manages data streams without lock contention.
- **Microstructure**: The structural mechanics, order flow dynamics, and liquidity depth through which trades occur.
- **Net Spread**: The actual realized percentage spread after accounting for maker/taker fees and VWAP slippage.
- **Order Book Imbalance (OBI)**: Ratio of bid volume to ask volume across top levels.
- **Round-Trip Time (RTT)**: Time required for a data packet to travel to a server and back.
- **Slippage**: Difference between expected price and actual execution price resulting from order book depth consumption.
- **Top of Book (TOB)**: The single highest bid price and lowest ask price on an order book.
- **Toxicity (VPIN)**: Measure of directional, informed order flow that threatens passive market makers.
- **Triangular Arbitrage**: Executing three trades across three currency pairs in a closed loop to extract pricing discrepancies.
- **Volume-Weighted Average Price (VWAP)**: The average fill price of an asset weighted by the quantity available at each price level.
- **Welford's Algorithm**: Numerically stable, one-pass method for computing running variance in $O(1)$ space.
