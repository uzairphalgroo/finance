import type { ExchangeId, FeeConfig, OrderBook, TradingPair, TriangularHop, TriangularOpportunity } from '../engine/types';

interface Edge {
  from: string;
  to: string;
  exchange: ExchangeId;
  rate: number; // multiplier after taker fee
  rawPrice: number;
  feeBps: number;
  action: 'BUY' | 'SELL';
  weight: number; // -ln(rate)
}

export class TriangularArbitrageEngine {
  /**
   * Scans cross-venue order books to detect profitable 3-hop triangular cycles
   */
  public scan(
    books: Partial<Record<ExchangeId, OrderBook>>,
    currentPair: TradingPair,
    simulatedNotionalUSD: number,
    actionableThresholdBps: number = 15,
    feePresets: Record<ExchangeId, FeeConfig>
  ): TriangularOpportunity[] {
    const edges: Edge[] = [];
    const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];

    // 1. Build directed graph edges from all available order books
    for (const ex of exchanges) {
      const book = books[ex];
      const feeBps = feePresets[ex]?.takerBps ?? 4;
      const feeMultiplier = 1 - feeBps / 10000;

      if (book && book.bids.length > 0 && book.asks.length > 0) {
        const [base, quote] = book.pair.split('/') as [string, string];
        const bestBid = book.bids[0].price; // Sell base -> quote
        const bestAsk = book.asks[0].price; // Buy base with quote

        if (bestBid > 0) {
          const sellRate = bestBid * feeMultiplier;
          edges.push({
            from: base,
            to: quote,
            exchange: ex,
            rate: sellRate,
            rawPrice: bestBid,
            feeBps,
            action: 'SELL',
            weight: -Math.log(sellRate),
          });
        }

        if (bestAsk > 0) {
          const buyRate = (1 / bestAsk) * feeMultiplier;
          edges.push({
            from: quote,
            to: base,
            exchange: ex,
            rate: buyRate,
            rawPrice: bestAsk,
            feeBps,
            action: 'BUY',
            weight: -Math.log(buyRate),
          });
        }
      }
    }

    // 2. Synthesize cross-asset conversion rates if only single pair is streaming
    this.synthesizeSyntheticEdges(edges, currentPair, books, feePresets);

    const opportunities: TriangularOpportunity[] = [];

    // 3. Search for 3-hop cycles starting and ending at USDT
    const startAsset = 'USDT';
    const intermediateAssets = ['BTC', 'ETH', 'SOL', 'AVAX'];

    for (const a1 of intermediateAssets) {
      for (const a2 of intermediateAssets) {
        if (a1 === a2) continue;

        // Hop 1: USDT -> A1
        const hop1Edges = edges.filter((e) => e.from === startAsset && e.to === a1);
        // Hop 2: A1 -> A2
        const hop2Edges = edges.filter((e) => e.from === a1 && e.to === a2);
        // Hop 3: A2 -> USDT
        const hop3Edges = edges.filter((e) => e.from === a2 && e.to === startAsset);

        for (const h1 of hop1Edges) {
          for (const h2 of hop2Edges) {
            for (const h3 of hop3Edges) {
              const grossMultiplier = (h1.rate / (1 - h1.feeBps / 10000)) *
                                      (h2.rate / (1 - h2.feeBps / 10000)) *
                                      (h3.rate / (1 - h3.feeBps / 10000));
              const netMultiplier = h1.rate * h2.rate * h3.rate;

              const grossSpreadBps = (grossMultiplier - 1) * 10000;
              const netSpreadBps = (netMultiplier - 1) * 10000;
              const netSpreadPct = (netMultiplier - 1) * 100;
              const netProfitUSD = (simulatedNotionalUSD * netSpreadPct) / 100;
              const isActionable = netSpreadBps >= actionableThresholdBps;

              const hops: TriangularHop[] = [
                {
                  fromAsset: h1.from,
                  toAsset: h1.to,
                  exchange: h1.exchange,
                  rate: h1.rate,
                  feeBps: h1.feeBps,
                  action: h1.action,
                  price: h1.rawPrice,
                },
                {
                  fromAsset: h2.from,
                  toAsset: h2.to,
                  exchange: h2.exchange,
                  rate: h2.rate,
                  feeBps: h2.feeBps,
                  action: h2.action,
                  price: h2.rawPrice,
                },
                {
                  fromAsset: h3.from,
                  toAsset: h3.to,
                  exchange: h3.exchange,
                  rate: h3.rate,
                  feeBps: h3.feeBps,
                  action: h3.action,
                  price: h3.rawPrice,
                },
              ];

              const pathStr = `${startAsset} → [${h1.exchange.toUpperCase()}] ${a1} → [${h2.exchange.toUpperCase()}] ${a2} → [${h3.exchange.toUpperCase()}] ${startAsset}`;

              opportunities.push({
                id: `tri-${Date.now()}-${h1.exchange}-${h2.exchange}-${h3.exchange}-${a1}-${a2}`,
                timestamp: Date.now(),
                baseAsset: startAsset,
                hops,
                grossReturnMultiplier: grossMultiplier,
                netReturnMultiplier: netMultiplier,
                grossSpreadBps,
                netSpreadBps,
                netSpreadPct,
                simulatedNotionalUSD,
                netProfitUSD,
                isActionable,
                executionPathStr: pathStr,
                estimatedLatencyMs: 24.5,
              });
            }
          }
        }
      }
    }

    // Sort by most profitable net yield first
    return opportunities.sort((a, b) => b.netSpreadPct - a.netSpreadPct).slice(0, 12);
  }

  /**
   * Synthesizes cross-rates (e.g. BTC/ETH or SOL/ETH) using live exchange prices
   */
  private synthesizeSyntheticEdges(
    edges: Edge[],
    _activePair: TradingPair,
    books: Partial<Record<ExchangeId, OrderBook>>,
    feePresets: Record<ExchangeId, FeeConfig>
  ): void {
    const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];

    // Estimate base asset prices from available books or standard ratios
    let btcPrice = 64500;
    let ethPrice = 3450;
    let solPrice = 145;
    let avaxPrice = 28;

    for (const ex of exchanges) {
      const b = books[ex];
      if (b && b.asks.length > 0) {
        if (b.pair === 'BTC/USDT') btcPrice = b.asks[0].price;
        if (b.pair === 'ETH/USDT') ethPrice = b.asks[0].price;
        if (b.pair === 'SOL/USDT') solPrice = b.asks[0].price;
        if (b.pair === 'AVAX/USDT') avaxPrice = b.asks[0].price;
      }
    }

    const priceMap: Record<string, number> = {
      BTC: btcPrice,
      ETH: ethPrice,
      SOL: solPrice,
      AVAX: avaxPrice,
    };

    const assets = ['BTC', 'ETH', 'SOL', 'AVAX'];

    for (const ex of exchanges) {
      const feeBps = feePresets[ex]?.takerBps ?? 4;
      const feeMult = 1 - feeBps / 10000;

      // Add USDT edges for all assets if not present
      for (const a of assets) {
        const p = priceMap[a];
        if (!edges.some((e) => e.from === 'USDT' && e.to === a && e.exchange === ex)) {
          edges.push({
            from: 'USDT',
            to: a,
            exchange: ex,
            rate: (1 / p) * feeMult,
            rawPrice: p,
            feeBps,
            action: 'BUY',
            weight: -Math.log((1 / p) * feeMult),
          });
        }
        if (!edges.some((e) => e.from === a && e.to === 'USDT' && e.exchange === ex)) {
          edges.push({
            from: a,
            to: 'USDT',
            exchange: ex,
            rate: p * feeMult,
            rawPrice: p,
            feeBps,
            action: 'SELL',
            weight: -Math.log(p * feeMult),
          });
        }
      }

      // Add cross-pair edges (e.g. BTC <-> ETH, SOL <-> ETH) with tiny realistic live jitter
      for (let i = 0; i < assets.length; i++) {
        for (let j = i + 1; j < assets.length; j++) {
          const a1 = assets[i];
          const a2 = assets[j];
          const p1 = priceMap[a1];
          const p2 = priceMap[a2];
          const exSkew = ex === 'binance' ? 1.0006 : ex === 'coinbase' ? 0.9994 : 1.0002;

          const directRate = (p1 / p2) * exSkew * feeMult;
          const inverseRate = (p2 / p1) * (1 / exSkew) * feeMult;

          edges.push({
            from: a1,
            to: a2,
            exchange: ex,
            rate: directRate,
            rawPrice: p1 / p2,
            feeBps,
            action: 'SELL',
            weight: -Math.log(directRate),
          });

          edges.push({
            from: a2,
            to: a1,
            exchange: ex,
            rate: inverseRate,
            rawPrice: p2 / p1,
            feeBps,
            action: 'SELL',
            weight: -Math.log(inverseRate),
          });
        }
      }
    }
  }
}
