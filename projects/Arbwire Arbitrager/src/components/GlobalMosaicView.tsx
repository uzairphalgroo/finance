import React from 'react';
import { Grid, ArrowRight, Play, Zap } from 'lucide-react';
import type { ArbitrageOpportunity, ExchangeId, OrderBook, TradingPair } from '../engine/types';
import { SoundFx } from '../services/SoundFx';

interface GlobalMosaicViewProps {
  pairs: TradingPair[];
  activePair: TradingPair;
  onSelectPair: (pair: TradingPair) => void;
  books: Partial<Record<ExchangeId, OrderBook>>;
  bestOpportunity: ArbitrageOpportunity | null;
  onExecuteTrade: (opp: ArbitrageOpportunity) => void;
}

export const GlobalMosaicView: React.FC<GlobalMosaicViewProps> = ({
  pairs,
  activePair,
  onSelectPair,
  books,
  bestOpportunity,
  onExecuteTrade,
}) => {
  const handleExecute = (pair: TradingPair) => {
    SoundFx.playExecutionSound();
    if (bestOpportunity && bestOpportunity.pair === pair) {
      onExecuteTrade(bestOpportunity);
    }
  };

  const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-tile rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-tech font-bold text-xs sm:text-sm text-white tracking-wider">
              GLOBAL CROSS-ASSET MOSAIC TERMINAL
            </h3>
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              High-density simultaneous monitoring of cross-venue spreads for top liquid digital assets
            </p>
          </div>
        </div>

        <span className="text-[11px] sm:text-xs font-mono text-emerald-400 font-bold self-end sm:self-auto">
          4 Asset Pairs Streaming
        </span>
      </div>

      {/* 2x2 High-Density Multi-Pair Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {pairs.map((pair) => {
          const isSelected = activePair === pair;
          const isBestPair = bestOpportunity?.pair === pair;

          return (
            <div
              key={pair}
              onClick={() => onSelectPair(pair)}
              className={`glass-tile rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer space-y-3 sm:space-y-4 ${
                isSelected
                  ? 'border-white/40 bg-white/[0.04] shadow-xl'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Pair Header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-tech font-black text-sm sm:text-base text-white">{pair}</span>
                  {isSelected && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase bg-white text-black">
                      ACTIVE STREAM
                    </span>
                  )}
                  {isBestPair && bestOpportunity?.isActionable && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                      ACTIONABLE
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExecute(pair);
                  }}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white hover:bg-slate-200 text-black font-mono font-bold text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-black" />
                  <span>Execute</span>
                </button>
              </div>

              {/* Spread & Pathway Details */}
              {isBestPair && bestOpportunity ? (
                <div className="space-y-2.5 sm:space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-black/70 border border-white/10">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="font-bold capitalize text-white text-[11px] sm:text-xs">{bestOpportunity.buyExchange}</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                      <span className="font-bold capitalize text-white text-[11px] sm:text-xs">{bestOpportunity.sellExchange}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-mono-nums font-black text-emerald-400">
                        +{bestOpportunity.netSpreadPct.toFixed(3)}%
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">
                        +${bestOpportunity.netProfitUSD.toFixed(2)} USD
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between">
                      <span className="text-slate-400">Buy Leg:</span>
                      <span className="font-bold text-slate-200">${bestOpportunity.buyPrice.toFixed(2)}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between">
                      <span className="text-slate-400">Sell Leg:</span>
                      <span className="font-bold text-slate-200">${bestOpportunity.sellPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {exchanges.map((ex) => {
                      const book = isSelected ? books[ex] : null;
                      const bid = book?.bids[0]?.price;
                      const ask = book?.asks[0]?.price;
                      return (
                        <div key={ex} className="p-2 sm:p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[9px] sm:text-[10px] space-y-0.5 sm:space-y-1">
                          <div className="capitalize font-bold text-slate-300 truncate">{ex}</div>
                          <div className="text-emerald-400 truncate">B: {bid ? bid.toFixed(1) : '---'}</div>
                          <div className="text-rose-400 truncate">A: {ask ? ask.toFixed(1) : '---'}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] text-slate-500 truncate">Click tile to focus full Level 2 ladder telemetry</span>
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

