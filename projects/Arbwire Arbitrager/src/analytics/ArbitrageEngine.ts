import type { ArbitrageOpportunity, ExchangeId, FeeConfig, OrderBook, TradingPair } from '../engine/types';


export interface ArbitrageScanResult {
  matrix: {
    buyExchange: ExchangeId;
    sellExchange: ExchangeId;
    grossSpreadPct: number;
    netSpreadPct: number;
    netProfitUSD: number;
    isActionable: boolean;
  }[];
  bestOpportunity: ArbitrageOpportunity | null;
  topOfBook: Record<ExchangeId, { bid: number; bidQty: number; ask: number; askQty: number; timestamp: number } | null>;
}

export class ArbitrageEngine {
  private defaultFees: Record<ExchangeId, FeeConfig> = {
    binance: { makerBps: 2, takerBps: 4 }, // Binance standard VIP0 tier (0.04% - 0.075%)
    coinbase: { makerBps: 4, takerBps: 6 }, // Coinbase Advanced tier (0.06%)
    kraken: { makerBps: 2.5, takerBps: 4 }, // Kraken Pro tier (0.04%)
  };

  /**
   * Calculate depth-weighted VWAP execution price for a given USD notional size.
   */
  public calculateVWAP(
    levels: { price: number; size: number }[],
    targetNotionalUSD: number,
    isBuy: boolean
  ): { vwapPrice: number; totalFilledUSD: number; slippagePct: number; topPrice: number } {
    if (!levels || levels.length === 0) {
      return { vwapPrice: 0, totalFilledUSD: 0, slippagePct: 0, topPrice: 0 };
    }

    const topPrice = levels[0].price;
    let accumulatedUSD = 0;
    let accumulatedQuantity = 0;

    for (const level of levels) {
      const levelUSD = level.price * level.size;
      const remainingUSDNeeded = targetNotionalUSD - accumulatedUSD;

      if (levelUSD <= remainingUSDNeeded) {
        accumulatedUSD += levelUSD;
        accumulatedQuantity += level.size;
      } else {
        // Partial fill on this level
        const partialQty = remainingUSDNeeded / level.price;
        accumulatedUSD += remainingUSDNeeded;
        accumulatedQuantity += partialQty;
        break;
      }
    }

    if (accumulatedUSD === 0 || accumulatedQuantity === 0) {
      return { vwapPrice: topPrice, totalFilledUSD: 0, slippagePct: 0, topPrice };
    }

    const vwapPrice = accumulatedUSD / accumulatedQuantity;
    // Slippage calculation:
    // If buying: paying higher than top ask -> (vwap - top) / top
    // If selling: receiving lower than top bid -> (top - vwap) / top
    const slippagePct = isBuy
      ? Math.max(0, ((vwapPrice - topPrice) / topPrice) * 100)
      : Math.max(0, ((topPrice - vwapPrice) / topPrice) * 100);

    return {
      vwapPrice,
      totalFilledUSD: accumulatedUSD,
      slippagePct,
      topPrice,
    };
  }

  /**
   * Scan active order books across venues to compute the cross-venue arbitrage matrix and find best actionable routes.
   */
  public scan(
    books: Partial<Record<ExchangeId, OrderBook>>,
    pair: TradingPair,
    targetNotionalUSD: number = 10000,
    thresholdPct: number = 0.15,
    customFees?: Record<ExchangeId, FeeConfig>
  ): ArbitrageScanResult {
    const fees = customFees || this.defaultFees;
    const exchanges = Object.keys(books) as ExchangeId[];
    const matrix: ArbitrageScanResult['matrix'] = [];
    const topOfBook: ArbitrageScanResult['topOfBook'] = {
      binance: null,
      coinbase: null,
      kraken: null,
    };

    let bestOpp: ArbitrageOpportunity | null = null;
    let maxNetSpread = -Infinity;

    // First populate top of book
    for (const ex of exchanges) {
      const book = books[ex];
      if (book && book.bids.length > 0 && book.asks.length > 0) {
        topOfBook[ex] = {
          bid: book.bids[0].price,
          bidQty: book.bids[0].size,
          ask: book.asks[0].price,
          askQty: book.asks[0].size,
          timestamp: book.timestamp,
        };
      }
    }

    // Pairwise comparison: Buy on Venue A (ask ladder), Sell on Venue B (bid ladder)
    for (const buyEx of exchanges) {
      const buyBook = books[buyEx];
      if (!buyBook || buyBook.asks.length === 0) continue;

      for (const sellEx of exchanges) {
        if (buyEx === sellEx) continue;
        const sellBook = books[sellEx];
        if (!sellBook || sellBook.bids.length === 0) continue;

        const topAsk = buyBook.asks[0].price;
        const topBid = sellBook.bids[0].price;

        // Top-of-book gross spread
        const grossSpreadPct = ((topBid - topAsk) / topAsk) * 100;
        const grossSpreadBps = grossSpreadPct * 100;

        // Calculate depth slippage
        const buyVWAP = this.calculateVWAP(buyBook.asks, targetNotionalUSD, true);
        const sellVWAP = this.calculateVWAP(sellBook.bids, targetNotionalUSD, false);
        const totalSlippagePct = buyVWAP.slippagePct + sellVWAP.slippagePct;

        // Fee structure (taker on both legs)
        const buyFeeBps = fees[buyEx]?.takerBps ?? 4;
        const sellFeeBps = fees[sellEx]?.takerBps ?? 4;
        const totalFeeBps = buyFeeBps + sellFeeBps;

        // Net VWAP spread after fees and slippage
        const effectiveBuyPrice = buyVWAP.vwapPrice * (1 + buyFeeBps / 10000);
        const effectiveSellPrice = sellVWAP.vwapPrice * (1 - sellFeeBps / 10000);
        const netSpreadPct = ((effectiveSellPrice - effectiveBuyPrice) / effectiveBuyPrice) * 100;
        const netSpreadBps = netSpreadPct * 100;
        const netProfitUSD = targetNotionalUSD * (netSpreadPct / 100);

        const isActionable = netSpreadPct >= thresholdPct;

        matrix.push({
          buyExchange: buyEx,
          sellExchange: sellEx,
          grossSpreadPct: Math.round(grossSpreadPct * 1000) / 1000,
          netSpreadPct: Math.round(netSpreadPct * 1000) / 1000,
          netProfitUSD: Math.round(netProfitUSD * 100) / 100,
          isActionable,
        });

        if (netSpreadPct > maxNetSpread) {
          maxNetSpread = netSpreadPct;
          bestOpp = {
            id: `arb-${Date.now()}-${buyEx}-${sellEx}`,
            timestamp: Date.now(),
            pair,
            buyExchange: buyEx,
            buyPrice: buyBook.asks[0].price,
            buySizeAvailable: buyBook.asks[0].size,
            sellExchange: sellEx,
            sellPrice: sellBook.bids[0].price,
            sellSizeAvailable: sellBook.bids[0].size,
            grossSpreadPct: Math.round(grossSpreadPct * 1000) / 1000,
            grossSpreadBps: Math.round(grossSpreadBps * 10) / 10,
            slippagePct: Math.round(totalSlippagePct * 1000) / 1000,
            buyFeeBps,
            sellFeeBps,
            totalFeeBps,
            netSpreadPct: Math.round(netSpreadPct * 1000) / 1000,
            netSpreadBps: Math.round(netSpreadBps * 10) / 10,
            simulatedNotionalUSD: targetNotionalUSD,
            netProfitUSD: Math.round(netProfitUSD * 100) / 100,
            isActionable,
            estimatedExecutionLatencyMs: 14.2, // estimated two-leg routing execution
          };
        }
      }
    }

    return {
      matrix,
      bestOpportunity: bestOpp,
      topOfBook,
    };
  }
}
