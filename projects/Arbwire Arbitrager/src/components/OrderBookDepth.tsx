import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { ExchangeId, OrderBook } from '../engine/types';

interface OrderBookDepthProps {
  books: Partial<Record<ExchangeId, OrderBook>>;
}

export const OrderBookDepth: React.FC<OrderBookDepthProps> = ({ books }) => {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>('binance');
  const [comparisonExchange, setComparisonExchange] = useState<ExchangeId>('coinbase');

  const exchanges: { id: ExchangeId; name: string }[] = [
    { id: 'binance', name: 'Binance' },
    { id: 'coinbase', name: 'Coinbase' },
    { id: 'kraken', name: 'Kraken' },
  ];

  const renderLadder = (exId: ExchangeId) => {
    const book = books[exId];
    if (!book || (!book.bids.length && !book.asks.length)) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-xs font-mono text-slate-500 gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#d4af37]/40 border-t-[#d4af37] animate-spin" />
          <span>Awaiting L2 order book stream for {exId}...</span>
        </div>
      );
    }

    const displayAsks = book.asks.slice(0, 8).reverse();
    const displayBids = book.bids.slice(0, 8);

    const allSizes = [...displayAsks, ...displayBids].map((l) => l.size);
    const maxSize = Math.max(...allSizes, 0.001);

    const bestBid = book.bids[0]?.price || 0;
    const bestAsk = book.asks[0]?.price || 0;
    const spreadUSD = bestAsk - bestBid;
    const spreadBps = bestAsk > 0 ? (spreadUSD / bestAsk) * 10000 : 0;

    return (
      <div className="font-mono text-xs select-none space-y-1">
        {/* Table Header */}
        <div className="grid grid-cols-3 text-[10px] text-slate-400 uppercase py-1 border-b border-white/10 px-2 font-bold tracking-wider">
          <span>Price (USD)</span>
          <span className="text-right">Size</span>
          <span className="text-right">Depth (USD)</span>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-0.5">
          {displayAsks.map((ask, idx) => {
            const widthPct = Math.min(100, (ask.size / maxSize) * 100);
            return (
              <div key={`ask-${idx}`} className="relative grid grid-cols-3 py-1 px-2 hover:bg-rose-500/10 transition-colors rounded">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-rose-600/20 pointer-events-none rounded-l"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="text-rose-400 font-mono-nums font-bold z-10">
                  {ask.price.toFixed(2)}
                </span>
                <span className="text-right text-slate-100 font-mono-nums z-10 font-bold">
                  {ask.size.toFixed(4)}
                </span>
                <span className="text-right text-slate-400 font-mono-nums z-10">
                  ${(ask.price * ask.size).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Inside Spread Separator Bar */}
        <div className="py-2.5 px-3.5 my-2 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-between text-[11px] font-mono shadow-inner">
          <span className="text-slate-300 font-bold uppercase text-[10px]">Inside Spread:</span>
          <span className="text-white font-black font-mono-nums text-xs">
            ${spreadUSD.toFixed(2)} ({spreadBps.toFixed(1)} bps)
          </span>
          <span className="text-slate-400 text-[10px]">
            Mid: ${((bestBid + bestAsk) / 2).toFixed(2)}
          </span>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {displayBids.map((bid, idx) => {
            const widthPct = Math.min(100, (bid.size / maxSize) * 100);
            return (
              <div key={`bid-${idx}`} className="relative grid grid-cols-3 py-1 px-2 hover:bg-emerald-500/10 transition-colors rounded">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/20 pointer-events-none rounded-l"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="text-emerald-400 font-mono-nums font-bold z-10">
                  {bid.price.toFixed(2)}
                </span>
                <span className="text-right text-slate-100 font-mono-nums z-10 font-bold">
                  {bid.size.toFixed(4)}
                </span>
                <span className="text-right text-slate-400 font-mono-nums z-10">
                  ${(bid.price * bid.size).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-tile rounded-2xl border border-white/10 p-3.5 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-tech font-bold text-xs sm:text-sm text-slate-100 tracking-wider">
              DUAL-VENUE L2 DEPTH LADDERS
            </h3>
            <p className="text-[9px] sm:text-[10px] font-mono text-slate-400">
              Side-by-Side Level 2 Order Book &amp; Spread Heatmaps
            </p>
          </div>
        </div>
        <span className="text-[11px] sm:text-xs font-mono text-emerald-400 font-bold self-end sm:self-auto">
          Heatmap Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Left Venue Ladder */}
        <div className="rounded-2xl bg-black/80 border border-white/10 p-3 sm:p-4 shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">Venue 1:</span>
              <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value as ExchangeId)}
                className="bg-slate-900 border border-white/20 text-xs font-mono rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-white font-bold"
              >
                {exchanges.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-black">L2 STREAM</span>
          </div>
          {renderLadder(selectedExchange)}
        </div>

        {/* Right Venue Ladder */}
        <div className="rounded-2xl bg-black/80 border border-white/10 p-3 sm:p-4 shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-300">Venue 2:</span>
              <select
                value={comparisonExchange}
                onChange={(e) => setComparisonExchange(e.target.value as ExchangeId)}
                className="bg-slate-900 border border-white/20 text-xs font-mono rounded-xl px-2.5 py-1 text-white focus:outline-none focus:border-white font-bold"
              >
                {exchanges.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-black">L2 STREAM</span>
          </div>
          {renderLadder(comparisonExchange)}
        </div>
      </div>
    </div>
  );
};
