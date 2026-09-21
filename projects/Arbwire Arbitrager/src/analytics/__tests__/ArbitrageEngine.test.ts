import { describe, it, expect } from 'vitest';
import { ArbitrageEngine } from '../ArbitrageEngine';
import type { OrderBook } from '../../engine/types';


describe('ArbitrageEngine', () => {
  const engine = new ArbitrageEngine();

  it('should calculate VWAP correctly across multiple depth tiers', () => {
    const askLevels = [
      { price: 100, size: 50 },  // $5,000 available at 100
      { price: 102, size: 100 }, // $10,200 available at 102
    ];

    // For a $5,000 order -> exactly fills level 1 at price 100
    const fill1 = engine.calculateVWAP(askLevels, 5000, true);
    expect(fill1.vwapPrice).toBe(100);
    expect(fill1.slippagePct).toBe(0);

    // For a $10,000 order -> $5,000 at 100 (50 qty) + $5,000 at 102 (~49.0196 qty)
    const fill2 = engine.calculateVWAP(askLevels, 10000, true);
    expect(fill2.vwapPrice).toBeGreaterThan(100);
    expect(fill2.vwapPrice).toBeLessThan(102);
    expect(fill2.slippagePct).toBeGreaterThan(0);
  });

  it('should detect cross-venue actionable arbitrage when spread exceeds 0.15%', () => {
    // Venue A (Binance): Best Ask = 90,000
    const binanceBook: OrderBook = {
      exchange: 'binance',
      pair: 'BTC/USDT',
      bids: [{ price: 89990, size: 2.0 }],
      asks: [{ price: 90000, size: 2.0 }], // Cheap asks
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    // Venue B (Coinbase): Best Bid = 90,300 (0.33% higher than Binance Ask!)
    const coinbaseBook: OrderBook = {
      exchange: 'coinbase',
      pair: 'BTC/USDT',
      bids: [{ price: 90300, size: 2.0 }], // High bids
      asks: [{ price: 90310, size: 2.0 }],
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    const result = engine.scan(
      { binance: binanceBook, coinbase: coinbaseBook },
      'BTC/USDT',
      10000,
      0.15
    );

    expect(result.bestOpportunity).not.toBeNull();
    expect(result.bestOpportunity?.buyExchange).toBe('binance');
    expect(result.bestOpportunity?.sellExchange).toBe('coinbase');
    expect(result.bestOpportunity?.grossSpreadPct).toBeCloseTo(0.333, 2);
    expect(result.bestOpportunity?.isActionable).toBe(true);
    expect(result.bestOpportunity?.netProfitUSD).toBeGreaterThan(15);
  });

  it('should mark sub-margin spreads as not actionable', () => {
    // Very tight spread (only 0.04% gross -> net negative after fees)
    const binanceBook: OrderBook = {
      exchange: 'binance',
      pair: 'BTC/USDT',
      bids: [{ price: 90000, size: 2.0 }],
      asks: [{ price: 90010, size: 2.0 }],
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    const coinbaseBook: OrderBook = {
      exchange: 'coinbase',
      pair: 'BTC/USDT',
      bids: [{ price: 90040, size: 2.0 }],
      asks: [{ price: 90050, size: 2.0 }],
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    const result = engine.scan(
      { binance: binanceBook, coinbase: coinbaseBook },
      'BTC/USDT',
      10000,
      0.15
    );

    expect(result.bestOpportunity?.isActionable).toBe(false);
  });
});
