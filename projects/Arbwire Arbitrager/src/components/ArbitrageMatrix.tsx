import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Flame, Layers, Zap, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ArbitrageScanResult } from '../analytics/ArbitrageEngine';
import type { ArbitrageOpportunity, EngineConfig, ExchangeId } from '../engine/types';
import { SoundFx } from '../services/SoundFx';

interface ArbitrageMatrixProps {
  scanResult: ArbitrageScanResult;
  config: EngineConfig;
  onExecuteSimulatedTrade?: (opp: ArbitrageOpportunity) => void;
}

export const ArbitrageMatrix: React.FC<ArbitrageMatrixProps> = ({
  scanResult,
  config,
  onExecuteSimulatedTrade,
}) => {
  const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];
  const { matrix, bestOpportunity, topOfBook } = scanResult;

  const [lastExecutedOpp, setLastExecutedOpp] = useState<{
    opp: ArbitrageOpportunity;
    executedAt: number;
    pnl: number;
  } | null>(null);

  const getExchangeName = (ex: ExchangeId) => {
    switch (ex) {
      case 'binance': return 'Binance';
      case 'coinbase': return 'Coinbase';
      case 'kraken': return 'Kraken';
    }
  };

  const getExchangeColor = (_ex: ExchangeId) => {
    return 'text-slate-100 border-white/20 bg-white/5';
  };

  const handleSimulateExecution = (opp: ArbitrageOpportunity) => {
    SoundFx.playExecutionSound();

    if (opp.isActionable) {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.35 },
        colors: ['#ffffff', '#10b981', '#cbd5e1', '#34d399'],
      });
    }

    setLastExecutedOpp({
      opp,
      executedAt: Date.now(),
      pnl: opp.netProfitUSD,
    });

    if (onExecuteSimulatedTrade) {
      onExecuteSimulatedTrade(opp);
    }
  };

  const handleExecuteCell = (cell: (typeof matrix)[0]) => {
    const buyTop = topOfBook[cell.buyExchange];
    const sellTop = topOfBook[cell.sellExchange];
    const buyPrice = buyTop ? buyTop.ask : 0;
    const sellPrice = sellTop ? sellTop.bid : 0;

    const opp: ArbitrageOpportunity = {
      id: `trade-${Date.now()}-${cell.buyExchange}-${cell.sellExchange}`,
      timestamp: Date.now(),
      pair: config.activePair,
      buyExchange: cell.buyExchange,
      buyPrice,
      buySizeAvailable: buyTop ? buyTop.askQty : 0,
      sellExchange: cell.sellExchange,
      sellPrice,
      sellSizeAvailable: sellTop ? sellTop.bidQty : 0,
      grossSpreadPct: cell.grossSpreadPct,
      grossSpreadBps: cell.grossSpreadPct * 100,
      slippagePct: 0.02,
      buyFeeBps: config.feePresets[cell.buyExchange]?.takerBps ?? 4,
      sellFeeBps: config.feePresets[cell.sellExchange]?.takerBps ?? 4,
      totalFeeBps: (config.feePresets[cell.buyExchange]?.takerBps ?? 4) + (config.feePresets[cell.sellExchange]?.takerBps ?? 4),
      netSpreadPct: cell.netSpreadPct,
      netSpreadBps: cell.netSpreadPct * 100,
      simulatedNotionalUSD: config.simulatedOrderSizeUSD,
      netProfitUSD: cell.netProfitUSD,
      isActionable: cell.isActionable,
      estimatedExecutionLatencyMs: 12.8,
    };

    handleSimulateExecution(opp);
  };

  return (
    <div className="space-y-4">
      {/* Actionable Anomaly Alert Banner */}
      {bestOpportunity && bestOpportunity.isActionable ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900/95 to-slate-900/90 p-4 sm:p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-400 transition-all duration-300 animate-fade-in-up">
          {/* Subtle Laser Sweep Beam */}
          <div className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-laser-sweep pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5 relative z-10">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold bg-emerald-400 text-black uppercase tracking-wider shadow-sm">
                    ACTIONABLE DISCREPANCY &gt; {config.actionableThresholdPct}%
                  </span>
                  <span className="text-xs sm:text-sm font-tech font-bold text-white">
                    {bestOpportunity.pair}
                  </span>
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-black/60 text-slate-300 font-mono border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    ~{bestOpportunity.estimatedExecutionLatencyMs}ms Wire Latency
                  </span>
                </div>

                {/* Route Visualizer */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px] uppercase font-bold">Pathway:</span>
                  <div className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-mono font-bold border ${getExchangeColor(bestOpportunity.buyExchange)} flex items-center gap-1.5`}>
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BUY {getExchangeName(bestOpportunity.buyExchange)} @ ${bestOpportunity.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 animate-pulse shrink-0" />
                  <div className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-mono font-bold border ${getExchangeColor(bestOpportunity.sellExchange)} flex items-center gap-1.5`}>
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SELL {getExchangeName(bestOpportunity.sellExchange)} @ ${bestOpportunity.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown & 1-Click Execution (Responsive Grid on Mobile) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-5 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-2.5 sm:p-0 rounded-xl bg-black/40 sm:bg-transparent border sm:border-0 border-white/10">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Gross Spread</div>
                  <div className="text-xs sm:text-sm font-mono-nums font-extrabold text-slate-200">
                    +{bestOpportunity.grossSpreadPct.toFixed(3)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase font-bold">Slippage & Fees</div>
                  <div className="text-xs font-mono-nums text-rose-400 font-bold">
                    -{(bestOpportunity.slippagePct + bestOpportunity.totalFeeBps / 100).toFixed(3)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase">Net Spread</div>
                  <div className="text-base sm:text-xl font-mono-nums font-black text-emerald-300">
                    +{bestOpportunity.netSpreadPct.toFixed(3)}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase">Net Profit</div>
                  <div className="text-base sm:text-xl font-mono-nums font-black text-emerald-400">
                    +${bestOpportunity.netProfitUSD.toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSimulateExecution(bestOpportunity)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-white hover:bg-slate-200 text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Simulate Route Fill</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-tile rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-75" />
            </div>
            <div className="text-xs font-mono text-slate-200">
              <span className="text-white font-bold">QUANTUM SCANNER ACTIVE:</span> Monitoring cross-venue order book ladders. Actionable banner triggers at <span className="text-emerald-400 font-bold">{config.actionableThresholdPct}%</span> net margin.
            </div>
          </div>
          {bestOpportunity && (
            <div className="text-xs font-mono text-slate-400 shrink-0">
              Top pathway: <span className="text-slate-200 font-bold">{getExchangeName(bestOpportunity.buyExchange)} &rarr; {getExchangeName(bestOpportunity.sellExchange)}</span> ({bestOpportunity.netSpreadPct > 0 ? '+' : ''}{bestOpportunity.netSpreadPct.toFixed(3)}%)
            </div>
          )}
        </div>
      )}

      {/* Simulated Execution Confirmation */}
      {lastExecutedOpp && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 text-xs font-mono text-slate-200 shadow-xl animate-fade-in-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>
              [SIMULATED 2-LEG ROUTE FILLED] Bought on <strong>{getExchangeName(lastExecutedOpp.opp.buyExchange)}</strong> @ ${lastExecutedOpp.opp.buyPrice.toFixed(2)} & Sold on <strong>{getExchangeName(lastExecutedOpp.opp.sellExchange)}</strong> @ ${lastExecutedOpp.opp.sellPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-4 font-bold self-end sm:self-auto shrink-0">
            <span className="text-slate-400">Notional: ${lastExecutedOpp.opp.simulatedNotionalUSD.toLocaleString()}</span>
            <span className="font-black text-emerald-400 text-sm">Net PnL: +${lastExecutedOpp.pnl.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Top of Book 3D Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 card-3d-wrap">
        {exchanges.map((ex) => {
          const tob = topOfBook[ex];
          return (
            <div
              key={ex}
              className="glass-tile card-3d rounded-2xl p-4 sm:p-4.5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${getExchangeColor(ex)}`}>
                  {getExchangeName(ex)}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {tob ? `${((Date.now() - tob.timestamp) / 1000).toFixed(1)}s age` : 'Streaming...'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-2">
                <div className="p-2.5 sm:p-3 rounded-xl bg-black/60 border border-emerald-500/20 shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase">Best Bid</div>
                  <div className="text-sm sm:text-base font-mono-nums font-bold text-emerald-300 truncate">
                    {tob ? `$${tob.bid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5 sm:mt-1 truncate">
                    Qty: {tob ? tob.bidQty.toFixed(4) : '—'}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-black/60 border border-rose-500/20 shadow-inner">
                  <div className="text-[9px] sm:text-[10px] font-mono text-rose-400 font-bold uppercase">Best Ask</div>
                  <div className="text-sm sm:text-base font-mono-nums font-bold text-rose-300 truncate">
                    {tob ? `$${tob.ask.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5 sm:mt-1 truncate">
                    Qty: {tob ? tob.askQty.toFixed(4) : '—'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Venue Arbitrage Matrix Table */}
      <div className="glass-tile rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-white shrink-0" />
            <h3 className="font-tech font-bold text-xs sm:text-sm text-white tracking-wider">
              CROSS-VENUE SPREAD &amp; NET ARBITRAGE MATRIX
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300">
            Order Sizing: <span className="text-white font-bold">${config.simulatedOrderSizeUSD.toLocaleString()} USD</span>
          </span>
        </div>

        <div className="overflow-x-auto touch-scroll-x">
          <table className="w-full min-w-[620px] text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/80 text-slate-400 uppercase text-[9px] sm:text-[10px] font-bold">
                <th className="py-3 px-3 sm:px-4">Buy Leg (Ask)</th>
                <th className="py-3 px-3 sm:px-4">Sell Leg (Bid)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Gross Spread</th>
                <th className="py-3 px-3 sm:px-4 text-right">Slippage &amp; Fees</th>
                <th className="py-3 px-3 sm:px-4 text-right">Net Spread (%)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Est. Profit (USD)</th>
                <th className="py-3 px-3 sm:px-4 text-center">Status</th>
                <th className="py-3 px-3 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {matrix.map((cell, idx) => {
                const isPositive = cell.netSpreadPct > 0;
                const isActionable = cell.isActionable;

                return (
                  <tr
                    key={`${cell.buyExchange}-${cell.sellExchange}-${idx}`}
                    className={`transition-colors hover:bg-white/[0.04] ${
                      isActionable ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold border ${getExchangeColor(cell.buyExchange)}`}>
                        {getExchangeName(cell.buyExchange)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold border ${getExchangeColor(cell.sellExchange)}`}>
                        {getExchangeName(cell.sellExchange)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono-nums whitespace-nowrap">
                      <span className={cell.grossSpreadPct > 0 ? 'text-slate-200' : 'text-slate-400'}>
                        {cell.grossSpreadPct > 0 ? '+' : ''}{cell.grossSpreadPct.toFixed(3)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono-nums text-rose-400/90 font-medium whitespace-nowrap">
                      -{(cell.grossSpreadPct - cell.netSpreadPct).toFixed(3)}%
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono-nums font-bold whitespace-nowrap">
                      <span
                        className={
                          isActionable
                            ? 'text-emerald-400 font-black text-sm'
                            : isPositive
                            ? 'text-emerald-300'
                            : 'text-slate-400'
                        }
                      >
                        {isPositive ? '+' : ''}{cell.netSpreadPct.toFixed(3)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono-nums font-bold whitespace-nowrap">
                      <span
                        className={
                          isActionable
                            ? 'text-emerald-400 font-black'
                            : isPositive
                            ? 'text-emerald-300'
                            : 'text-slate-400'
                        }
                      >
                        {isPositive ? '+' : ''}${cell.netProfitUSD.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      {isActionable ? (
                        <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ACTIONABLE
                        </span>
                      ) : isPositive ? (
                        <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-slate-900 text-slate-300 border border-white/10">
                          SUB-MARGIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] bg-black text-slate-500">
                          NEGATIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleExecuteCell(cell)}
                        disabled={!isPositive}
                        className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          isActionable
                            ? 'bg-white hover:bg-slate-200 text-black'
                            : isPositive
                            ? 'bg-slate-900 hover:bg-slate-800 text-white border border-white/20'
                            : 'bg-black/60 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        Execute
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
  );
};
