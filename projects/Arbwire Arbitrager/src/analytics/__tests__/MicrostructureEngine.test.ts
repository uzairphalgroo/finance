import { describe, it, expect } from 'vitest';
import { MicrostructureEngine } from '../MicrostructureEngine';
import type { OrderBook } from '../../engine/types';

describe('MicrostructureEngine', () => {
  const engine = new MicrostructureEngine();

  it('should return neutral metrics for empty or undefined books', () => {
    const result = engine.analyze('binance', 'BTC/USDT', undefined);
    expect(result.top5Imbalance).toBe(0);
    expect(result.top10Imbalance).toBe(0);
    expect(result.directionalPressure).toBe('NEUTRAL');
    expect(result.bidDepthUSD).toBe(0);
    expect(result.askDepthUSD).toBe(0);
  });

  it('should calculate positive OBI and Bullish pressure on bid-heavy books', () => {
    const book: OrderBook = {
      exchange: 'binance',
      pair: 'BTC/USDT',
      bids: [
        { price: 65000, size: 10.0 },
        { price: 64990, size: 8.0 },
        { price: 64980, size: 6.0 },
        { price: 64970, size: 4.0 },
        { price: 64960, size: 2.0 },
      ],
      asks: [
        { price: 65010, size: 1.0 },
        { price: 65020, size: 1.0 },
        { price: 65030, size: 1.0 },
        { price: 65040, size: 1.0 },
        { price: 65050, size: 1.0 },
      ],
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    const metrics = engine.analyze('binance', 'BTC/USDT', book);
    expect(metrics.top5Imbalance).toBeGreaterThan(0.5);
    expect(metrics.directionalPressure).toBe('BULLISH');
    expect(metrics.bidDepthUSD).toBeGreaterThan(metrics.askDepthUSD);
    expect(metrics.spreadBps).toBeGreaterThan(0);
    expect(metrics.toxicityVpin).toBeGreaterThan(0);
  });

  it('should calculate negative OBI and Bearish pressure on ask-heavy books', () => {
    const book: OrderBook = {
      exchange: 'binance',
      pair: 'ETH/USDT',
      bids: [
        { price: 3400, size: 1.0 },
        { price: 3399, size: 1.0 },
        { price: 3398, size: 1.0 },
        { price: 3397, size: 1.0 },
        { price: 3396, size: 1.0 },
      ],
      asks: [
        { price: 3401, size: 15.0 },
        { price: 3402, size: 12.0 },
        { price: 3403, size: 10.0 },
        { price: 3404, size: 8.0 },
        { price: 3405, size: 5.0 },
      ],
      timestamp: Date.now(),
      localTimestamp: Date.now(),
    };

    const metrics = engine.analyze('binance', 'ETH/USDT', book);
    expect(metrics.top5Imbalance).toBeLessThan(-0.5);
    expect(metrics.directionalPressure).toBe('BEARISH');
    expect(metrics.askDepthUSD).toBeGreaterThan(metrics.bidDepthUSD);
  });
});
