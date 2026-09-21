import type { ExchangeId, MicrostructureMetrics, OrderBook, TradingPair } from '../engine/types';

export class MicrostructureEngine {
  private lastMidPrices: Partial<Record<ExchangeId, number>> = {};
  private priceVelocity: Partial<Record<ExchangeId, number>> = {};

  /**
   * Computes market microstructure, Order Book Imbalance (OBI), and toxicity for an order book
   */
  public analyze(
    exchange: ExchangeId,
    pair: TradingPair,
    book?: OrderBook
  ): MicrostructureMetrics {
    if (!book || book.bids.length === 0 || book.asks.length === 0) {
      return {
        exchange,
        pair,
        top5Imbalance: 0,
        top10Imbalance: 0,
        bidDepthUSD: 0,
        askDepthUSD: 0,
        spreadBps: 0,
        directionalPressure: 'NEUTRAL',
        toxicityVpin: 0.15,
        predictedSpreadShiftBps: 0,
        timestamp: Date.now(),
      };
    }

    const top5Bids = book.bids.slice(0, 5);
    const top5Asks = book.asks.slice(0, 5);
    const top10Bids = book.bids.slice(0, 10);
    const top10Asks = book.asks.slice(0, 10);

    // Sum quantities
    const sum5BidQty = top5Bids.reduce((acc, l) => acc + l.size, 0);
    const sum5AskQty = top5Asks.reduce((acc, l) => acc + l.size, 0);
    const sum10BidQty = top10Bids.reduce((acc, l) => acc + l.size, 0);
    const sum10AskQty = top10Asks.reduce((acc, l) => acc + l.size, 0);

    // Order Book Imbalance (OBI) in [-1, +1]
    const top5Imbalance = (sum5BidQty + sum5AskQty) > 0
      ? (sum5BidQty - sum5AskQty) / (sum5BidQty + sum5AskQty)
      : 0;

    const top10Imbalance = (sum10BidQty + sum10AskQty) > 0
      ? (sum10BidQty - sum10AskQty) / (sum10BidQty + sum10AskQty)
      : 0;

    // USD Notional Depth
    const bidDepthUSD = top10Bids.reduce((acc, l) => acc + l.price * l.size, 0);
    const askDepthUSD = top10Asks.reduce((acc, l) => acc + l.price * l.size, 0);

    // Spread in bps
    const bestBid = book.bids[0].price;
    const bestAsk = book.asks[0].price;
    const mid = (bestBid + bestAsk) / 2;
    const spreadUSD = Math.max(0, bestAsk - bestBid);
    const spreadBps = mid > 0 ? (spreadUSD / mid) * 10000 : 0;

    // Track price velocity & directional momentum
    const lastMid = this.lastMidPrices[exchange] || mid;
    const delta = mid - lastMid;
    this.lastMidPrices[exchange] = mid;
    this.priceVelocity[exchange] = delta;

    let directionalPressure: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (top5Imbalance > 0.25 || delta > 0.5) {
      directionalPressure = 'BULLISH';
    } else if (top5Imbalance < -0.25 || delta < -0.5) {
      directionalPressure = 'BEARISH';
    }

    // VPIN (Volume-Synchronized Probability of Toxicity) approximation
    // Higher imbalance + tight spread = higher probability of informed institutional flow
    const depthRatio = Math.abs(top5Imbalance);
    const toxicityVpin = Math.min(0.95, Math.max(0.05, depthRatio * 0.7 + (spreadBps < 1.5 ? 0.2 : 0.05)));

    // Predicted short-term spread shift (in bps)
    const predictedSpreadShiftBps = top5Imbalance * (spreadBps * 0.4);

    return {
      exchange,
      pair,
      top5Imbalance,
      top10Imbalance,
      bidDepthUSD,
      askDepthUSD,
      spreadBps,
      directionalPressure,
      toxicityVpin,
      predictedSpreadShiftBps,
      timestamp: Date.now(),
    };
  }
}
