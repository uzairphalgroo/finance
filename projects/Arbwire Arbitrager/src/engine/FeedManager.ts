import { ArbitrageEngine } from '../analytics/ArbitrageEngine';
import type { ArbitrageScanResult } from '../analytics/ArbitrageEngine';
import { BinanceFeed } from './exchanges/BinanceFeed';
import { CoinbaseFeed } from './exchanges/CoinbaseFeed';
import { KrakenFeed } from './exchanges/KrakenFeed';
import type { ArbitrageOpportunity, EngineConfig, ExchangeId, IExchangeFeed, LatencyMetrics, OrderBook, TradingPair } from './types';

export type FeedManagerSubscriber = (data: {
  pair: TradingPair;
  books: Partial<Record<ExchangeId, OrderBook>>;
  scanResult: ArbitrageScanResult;
  metrics: Record<ExchangeId, LatencyMetrics>;
}) => void;

export class FeedManager {
  private feeds: Record<ExchangeId, IExchangeFeed> = {} as any;
  private currentBooks: Partial<Record<ExchangeId, OrderBook>> = {};
  private arbitrageEngine: ArbitrageEngine = new ArbitrageEngine();
  private subscribers: Set<FeedManagerSubscriber> = new Set();
  private opportunityListeners: Set<(opp: ArbitrageOpportunity) => void> = new Set();

  private config: EngineConfig = {
    actionableThresholdPct: 0.15,
    simulatedOrderSizeUSD: 10000,
    feePresets: {
      binance: { makerBps: 2, takerBps: 4 },
      coinbase: { makerBps: 4, takerBps: 6 },
      kraken: { makerBps: 2.5, takerBps: 4 },
    },
    bufferCapacity: 2000,
    soundEnabled: true,
    activePair: 'BTC/USDT',
  };

  private isRunning: boolean = false;
  private lastNotifiedOpportunityId: string = '';
  private rafId: number | null = null;
  private dirty: boolean = false;

  constructor(initialConfig?: Partial<EngineConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
    this.initFeeds();
  }

  private initFeeds(): void {
    this.teardownFeeds();

    const exchanges: ExchangeId[] = ['binance', 'coinbase', 'kraken'];

    for (const ex of exchanges) {
      if (ex === 'binance') this.feeds[ex] = new BinanceFeed(this.config.bufferCapacity);
      else if (ex === 'coinbase') this.feeds[ex] = new CoinbaseFeed(this.config.bufferCapacity);
      else if (ex === 'kraken') this.feeds[ex] = new KrakenFeed(this.config.bufferCapacity);

      this.setupFeedListeners(this.feeds[ex]);
    }
  }

  private setupFeedListeners(feed: IExchangeFeed): void {
    feed.on('orderBook', (book: OrderBook) => {
      this.currentBooks[feed.exchangeId] = book;
      this.dirty = true;
    });

    feed.on('stateChange', () => {
      this.dirty = true;
    });
  }

  private teardownFeeds(): void {
    for (const ex in this.feeds) {
      const feed = this.feeds[ex as ExchangeId];
      if (feed) {
        feed.disconnect();
      }
    }
    this.feeds = {} as any;
    this.currentBooks = {};
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const ex in this.feeds) {
      this.feeds[ex as ExchangeId].connect(this.config.activePair);
    }

    this.startRenderLoop();
  }

  public stop(): void {
    this.isRunning = false;
    this.stopRenderLoop();
    for (const ex in this.feeds) {
      this.feeds[ex as ExchangeId].disconnect();
    }
  }

  public setPair(pair: TradingPair): void {
    this.config.activePair = pair;
    this.currentBooks = {};
    for (const ex in this.feeds) {
      this.feeds[ex as ExchangeId].changePair(pair);
    }
    this.dirty = true;
  }

  public updateConfig(newConfig: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.dirty = true;
  }

  /**
   * 60FPS Micro-batched dispatch loop using requestAnimationFrame to prevent React DOM thrashing
   */
  private startRenderLoop(): void {
    const loop = () => {
      if (!this.isRunning) return;

      if (this.dirty) {
        this.dirty = false;
        this.dispatchUpdate();
      }

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  private stopRenderLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private dispatchUpdate(): void {
    const scanResult = this.arbitrageEngine.scan(
      this.currentBooks,
      this.config.activePair,
      this.config.simulatedOrderSizeUSD,
      this.config.actionableThresholdPct,
      this.config.feePresets
    );

    const metrics: Record<ExchangeId, LatencyMetrics> = {
      binance: this.feeds['binance']?.getMetrics() || this.createEmptyMetrics('binance'),
      coinbase: this.feeds['coinbase']?.getMetrics() || this.createEmptyMetrics('coinbase'),
      kraken: this.feeds['kraken']?.getMetrics() || this.createEmptyMetrics('kraken'),
    };

    // Check for new actionable opportunity to fire alert
    if (scanResult.bestOpportunity && scanResult.bestOpportunity.isActionable) {
      if (scanResult.bestOpportunity.id !== this.lastNotifiedOpportunityId) {
        this.lastNotifiedOpportunityId = scanResult.bestOpportunity.id;
        for (const listener of this.opportunityListeners) {
          listener(scanResult.bestOpportunity);
        }
      }
    }

    const payload = {
      pair: this.config.activePair,
      books: { ...this.currentBooks },
      scanResult,
      metrics,
    };

    for (const sub of this.subscribers) {
      try {
        sub(payload);
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    }
  }

  private createEmptyMetrics(exchange: ExchangeId): LatencyMetrics {
    return {
      exchange,
      connectionState: 'DISCONNECTED',
      pingRttMs: 0,
      avgPingRttMs: 0,
      minPingRttMs: 0,
      maxPingRttMs: 0,
      packetJitterMs: 0,
      msgPerSecond: 0,
      totalMessages: 0,
      droppedMessages: 0,
      queueSaturationPct: 0,
      lastMsgTimestamp: 0,
      orderBookDriftMs: 0,
      reconnectCount: 0,
    };
  }

  public subscribe(sub: FeedManagerSubscriber): () => void {
    this.subscribers.add(sub);
    return () => this.subscribers.delete(sub);
  }

  public onActionableOpportunity(listener: (opp: ArbitrageOpportunity) => void): () => void {
    this.opportunityListeners.add(listener);
    return () => this.opportunityListeners.delete(listener);
  }

  public getConfig(): EngineConfig {
    return { ...this.config };
  }

  public getFeed(exchange: ExchangeId): IExchangeFeed | undefined {
    return this.feeds[exchange];
  }
}
