export type ExchangeId = 'binance' | 'coinbase' | 'kraken';

export type TradingPair = 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'AVAX/USDT';

export type ViewMode = 'tactical' | 'triangular' | 'bot' | 'microstructure' | 'mosaic';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

export interface OrderBookLevel {
  price: number;
  size: number;
  total?: number;
}

export interface OrderBook {
  exchange: ExchangeId;
  pair: TradingPair;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  sequence?: number;
  localTimestamp: number;
}

export interface TickerUpdate {
  exchange: ExchangeId;
  pair: TradingPair;
  bestBid: number;
  bestBidQty: number;
  bestAsk: number;
  bestAskQty: number;
  timestamp: number;
  localTimestamp: number;
}

export type AutoCapturePeriod = 'off' | '15s' | '30s' | '1m' | '3m' | '5m' | '15m';

export interface ArbitrageOpportunity {
  id: string;
  timestamp: number;
  pair: TradingPair;
  buyExchange: ExchangeId;
  buyPrice: number;
  buySizeAvailable: number;
  sellExchange: ExchangeId;
  sellPrice: number;
  sellSizeAvailable: number;
  grossSpreadPct: number;
  grossSpreadBps: number;
  slippagePct: number;
  buyFeeBps: number;
  sellFeeBps: number;
  totalFeeBps: number;
  netSpreadPct: number;
  netSpreadBps: number;
  simulatedNotionalUSD: number;
  netProfitUSD: number;
  isActionable: boolean; // > 0.15% threshold
  estimatedExecutionLatencyMs: number;
  isSaved?: boolean;
  captureType?: 'auto' | 'manual' | 'execution';
  captureInterval?: AutoCapturePeriod;
}

export interface TriangularHop {
  fromAsset: string;
  toAsset: string;
  exchange: ExchangeId;
  rate: number;
  feeBps: number;
  action: 'BUY' | 'SELL';
  price: number;
}

export interface TriangularOpportunity {
  id: string;
  timestamp: number;
  baseAsset: string;
  hops: TriangularHop[];
  grossReturnMultiplier: number;
  netReturnMultiplier: number;
  grossSpreadBps: number;
  netSpreadBps: number;
  netSpreadPct: number;
  simulatedNotionalUSD: number;
  netProfitUSD: number;
  isActionable: boolean;
  executionPathStr: string;
  estimatedLatencyMs: number;
}

export interface MicrostructureMetrics {
  exchange: ExchangeId;
  pair: TradingPair;
  top5Imbalance: number; // -1 (heavy ask) to +1 (heavy bid)
  top10Imbalance: number;
  bidDepthUSD: number;
  askDepthUSD: number;
  spreadBps: number;
  directionalPressure: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  toxicityVpin: number; // 0.0 to 1.0
  predictedSpreadShiftBps: number;
  timestamp: number;
}

export interface BotTradeRecord {
  id: string;
  timestamp: number;
  pair: string;
  type: '2-LEG' | 'TRIANGULAR';
  buyVenue: string;
  sellVenue: string;
  notionalUSD: number;
  netProfitUSD: number;
  netSpreadPct: number;
  latencyMs: number;
  aiAssisted: boolean;
  aiConfidence?: number;
}

export interface EquityPoint {
  time: number;
  cumulativePnL: number;
  tradesCount: number;
}

export interface PortfolioBalance {
  totalEquityUSD: number;
  initialCapitalUSD: number;
  cashUSDT: number;
  inventory: Record<string, number>; // asset -> quantity
  exchangeAllocation: Record<ExchangeId, number>; // exchange -> USD balance
}

export interface BotConfig {
  autoExecute: boolean;
  minNetSpreadPct: number;
  maxExecutionLatencyMs: number;
  orderSizeUSD: number;
  maxDailyDrawdownUSD: number;
  aiAssistedFiltering: boolean;
}

export interface LatencyMetrics {
  exchange: ExchangeId;
  connectionState: ConnectionState;
  pingRttMs: number;
  avgPingRttMs: number;
  minPingRttMs: number;
  maxPingRttMs: number;
  packetJitterMs: number; // Inter-arrival standard deviation
  msgPerSecond: number;
  totalMessages: number;
  droppedMessages: number;
  queueSaturationPct: number;
  lastMsgTimestamp: number;
  orderBookDriftMs: number;
  reconnectCount: number;
  lastError?: string;
}

export interface FeeConfig {
  makerBps: number; // e.g. 2 bps (0.02%)
  takerBps: number; // e.g. 6 bps (0.06%)
}

export interface EngineConfig {
  actionableThresholdPct: number; // e.g., 0.15%
  simulatedOrderSizeUSD: number; // e.g., 10000 USD
  feePresets: Record<ExchangeId, FeeConfig>;
  bufferCapacity: number;
  soundEnabled: boolean;
  activePair: TradingPair;
}

export interface ExchangeFeedEventMap {
  ticker: (ticker: TickerUpdate) => void;
  orderBook: (book: OrderBook) => void;
  metrics: (metrics: Partial<LatencyMetrics>) => void;
  stateChange: (state: ConnectionState) => void;
  error: (err: Error) => void;
}

export interface IExchangeFeed {
  readonly exchangeId: ExchangeId;
  readonly connectionState: ConnectionState;
  connect(pair: TradingPair): void;
  disconnect(): void;
  changePair(pair: TradingPair): void;
  getMetrics(): LatencyMetrics;
  on<K extends keyof ExchangeFeedEventMap>(event: K, listener: ExchangeFeedEventMap[K]): void;
  off<K extends keyof ExchangeFeedEventMap>(event: K, listener: ExchangeFeedEventMap[K]): void;
}

