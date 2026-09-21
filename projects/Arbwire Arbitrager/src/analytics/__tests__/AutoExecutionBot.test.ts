import { describe, it, expect } from 'vitest';
import { AutoExecutionBot } from '../AutoExecutionBot';
import type { ArbitrageOpportunity, TriangularOpportunity } from '../../engine/types';

describe('AutoExecutionBot', () => {
  it('should not execute trades when autoExecute is false', () => {
    const bot = new AutoExecutionBot({ autoExecute: false });
    const mockOpp: ArbitrageOpportunity = {
      id: 'test-1',
      pair: 'BTC/USDT',
      buyExchange: 'binance',
      buyPrice: 65000,
      buySizeAvailable: 1.5,
      sellExchange: 'coinbase',
      sellPrice: 65227,
      sellSizeAvailable: 1.5,
      grossSpreadPct: 0.45,
      grossSpreadBps: 45,
      slippagePct: 0.02,
      buyFeeBps: 4,
      sellFeeBps: 4,
      totalFeeBps: 8,
      netSpreadPct: 0.35,
      netSpreadBps: 35,
      simulatedNotionalUSD: 10000,
      netProfitUSD: 35,
      isActionable: true,
      timestamp: Date.now(),
      estimatedExecutionLatencyMs: 15,
    };

    const executed = bot.evaluateAndExecute2Leg(mockOpp);
    expect(executed).toBe(false);
    expect(bot.getTradeHistory().length).toBe(0);
  });

  it('should auto-execute profitable 2-leg opportunities and update equity curve', () => {
    const bot = new AutoExecutionBot({ autoExecute: true, minNetSpreadPct: 0.15 });
    const initialEquity = bot.getBalance().totalEquityUSD;

    const mockOpp: ArbitrageOpportunity = {
      id: 'test-2',
      pair: 'BTC/USDT',
      buyExchange: 'binance',
      buyPrice: 65000,
      buySizeAvailable: 1.5,
      sellExchange: 'coinbase',
      sellPrice: 65227,
      sellSizeAvailable: 1.5,
      grossSpreadPct: 0.45,
      grossSpreadBps: 45,
      slippagePct: 0.02,
      buyFeeBps: 4,
      sellFeeBps: 4,
      totalFeeBps: 8,
      netSpreadPct: 0.35,
      netSpreadBps: 35,
      simulatedNotionalUSD: 10000,
      netProfitUSD: 35,
      isActionable: true,
      timestamp: Date.now(),
      estimatedExecutionLatencyMs: 15,
    };

    let filledTrade = null;
    const executed = bot.evaluateAndExecute2Leg(mockOpp, (trade) => {
      filledTrade = trade;
    });

    expect(executed).toBe(true);
    expect(filledTrade).not.toBeNull();
    expect(bot.getTradeHistory().length).toBe(1);
    expect(bot.getBalance().totalEquityUSD).toBe(initialEquity + 35);

    const stats = bot.getPerformanceStats();
    expect(stats.totalTrades).toBe(1);
    expect(stats.winRatePct).toBe(100);
    expect(stats.cumulativePnLUSD).toBe(35);
  });

  it('should auto-execute profitable triangular opportunities', () => {
    const bot = new AutoExecutionBot({ autoExecute: true, minNetSpreadPct: 0.10 });
    const initialEquity = bot.getBalance().totalEquityUSD;

    const mockTriOpp: TriangularOpportunity = {
      id: 'tri-test-1',
      timestamp: Date.now(),
      baseAsset: 'USDT',
      hops: [
        { fromAsset: 'USDT', toAsset: 'BTC', exchange: 'binance', rate: 0.000015, feeBps: 4, action: 'BUY', price: 65000 },
        { fromAsset: 'BTC', toAsset: 'ETH', exchange: 'coinbase', rate: 18.8, feeBps: 6, action: 'SELL', price: 18.8 },
        { fromAsset: 'ETH', toAsset: 'USDT', exchange: 'kraken', rate: 3460, feeBps: 4, action: 'SELL', price: 3460 },
      ],
      grossReturnMultiplier: 1.004,
      netReturnMultiplier: 1.0025,
      grossSpreadBps: 40,
      netSpreadBps: 25,
      netSpreadPct: 0.25,
      simulatedNotionalUSD: 10000,
      netProfitUSD: 25,
      isActionable: true,
      executionPathStr: 'USDT → [BINANCE] BTC → [COINBASE] ETH → [KRAKEN] USDT',
      estimatedLatencyMs: 22,
    };

    const executed = bot.evaluateAndExecuteTriangular(mockTriOpp);
    expect(executed).toBe(true);
    expect(bot.getTradeHistory().length).toBe(1);
    expect(bot.getTradeHistory()[0].type).toBe('TRIANGULAR');
    expect(bot.getBalance().totalEquityUSD).toBe(initialEquity + 25);
  });

  it('should reset portfolio cleanly', () => {
    const bot = new AutoExecutionBot({ autoExecute: true });
    bot.resetPortfolio();
    expect(bot.getBalance().totalEquityUSD).toBe(100000);
    expect(bot.getTradeHistory().length).toBe(0);
    expect(bot.getPerformanceStats().cumulativePnLUSD).toBe(0);
  });
});
