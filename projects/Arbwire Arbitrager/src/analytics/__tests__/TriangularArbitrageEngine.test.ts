import { describe, it, expect } from 'vitest';
import { TriangularArbitrageEngine } from '../TriangularArbitrageEngine';
import type { ExchangeId, FeeConfig, OrderBook } from '../../engine/types';

describe('TriangularArbitrageEngine', () => {
  const engine = new TriangularArbitrageEngine();

  const defaultFees: Record<ExchangeId, FeeConfig> = {
    binance: { makerBps: 2, takerBps: 4 },
    coinbase: { makerBps: 4, takerBps: 6 },
    kraken: { makerBps: 2.5, takerBps: 4 },
  };

  it('should detect profitable triangular arbitrage opportunities across multi-hop cycle', () => {
    const books: Partial<Record<ExchangeId, OrderBook>> = {
      binance: {
        exchange: 'binance',
        pair: 'BTC/USDT',
        bids: [{ price: 65000, size: 5.0 }],
        asks: [{ price: 65050, size: 5.0 }],
        timestamp: Date.now(),
        localTimestamp: Date.now(),
      },
      coinbase: {
        exchange: 'coinbase',
        pair: 'ETH/USDT',
        bids: [{ price: 3450, size: 20.0 }],
        asks: [{ price: 3455, size: 20.0 }],
        timestamp: Date.now(),
        localTimestamp: Date.now(),
      },
      kraken: {
        exchange: 'kraken',
        pair: 'SOL/USDT',
        bids: [{ price: 145, size: 100.0 }],
        asks: [{ price: 145.2, size: 100.0 }],
        timestamp: Date.now(),
        localTimestamp: Date.now(),
      },
    };

    const opportunities = engine.scan(
      books,
      'BTC/USDT',
      10000,
      10, // 10 bps threshold
      defaultFees
    );

    expect(Array.isArray(opportunities)).toBe(true);
    expect(opportunities.length).toBeGreaterThan(0);

    const topOpp = opportunities[0];
    expect(topOpp.baseAsset).toBe('USDT');
    expect(topOpp.hops).toHaveLength(3);
    expect(topOpp.hops[0].fromAsset).toBe('USDT');
    expect(topOpp.hops[2].toAsset).toBe('USDT');
    expect(typeof topOpp.netSpreadBps).toBe('number');
    expect(typeof topOpp.netProfitUSD).toBe('number');
    expect(topOpp.executionPathStr).toContain('USDT');
  });

  it('should correctly flag actionable opportunities based on threshold', () => {
    const books: Partial<Record<ExchangeId, OrderBook>> = {
      binance: {
        exchange: 'binance',
        pair: 'BTC/USDT',
        bids: [{ price: 65000, size: 5.0 }],
        asks: [{ price: 65050, size: 5.0 }],
        timestamp: Date.now(),
        localTimestamp: Date.now(),
      },
    };

    // Very high threshold (e.g. 500 bps = 5%) -> should not be actionable
    const opportunities = engine.scan(
      books,
      'BTC/USDT',
      10000,
      500,
      defaultFees
    );

    const actionable = opportunities.filter((o) => o.isActionable);
    expect(actionable.length).toBe(0);
  });
});
