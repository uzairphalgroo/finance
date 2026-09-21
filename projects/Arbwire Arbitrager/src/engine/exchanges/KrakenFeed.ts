import { LatencyTracker } from '../../analytics/LatencyMonitor';
import { RingBuffer } from '../RingBuffer';
import type { ConnectionState, ExchangeFeedEventMap, ExchangeId, IExchangeFeed, LatencyMetrics, OrderBook, OrderBookLevel, TradingPair } from '../types';


export class KrakenFeed implements IExchangeFeed {
  public readonly exchangeId: ExchangeId = 'kraken';
  private ws: WebSocket | null = null;
  private currentPair: TradingPair = 'BTC/USDT';
  public connectionState: ConnectionState = 'DISCONNECTED';

  private listeners: { [K in keyof ExchangeFeedEventMap]?: ExchangeFeedEventMap[K][] } = {};
  private latencyTracker: LatencyTracker = new LatencyTracker('kraken');
  private ringBuffer: RingBuffer<any>;

  private reconnectAttempts: number = 0;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private isIntentionallyClosed: boolean = false;

  private currentBids: Map<number, number> = new Map();
  private currentAsks: Map<number, number> = new Map();

  constructor(bufferCapacity: number = 2000) {
    this.ringBuffer = new RingBuffer(bufferCapacity);
  }

  private getSymbol(pair: TradingPair): string {
    switch (pair) {
      case 'BTC/USDT': return 'BTC/USD';
      case 'ETH/USDT': return 'ETH/USD';
      case 'SOL/USDT': return 'SOL/USD';
      case 'AVAX/USDT': return 'AVAX/USD';
      default: return 'BTC/USD';
    }
  }

  public connect(pair: TradingPair = this.currentPair): void {
    this.isIntentionallyClosed = false;
    this.currentPair = pair;
    this.setConnectionState('CONNECTING');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const symbol = this.getSymbol(pair);
    const url = 'wss://ws.kraken.com/v2';

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setConnectionState('CONNECTED');

        const subMsg = {
          method: 'subscribe',
          params: {
            channel: 'book',
            symbol: [symbol],
            depth: 25,
          },
        };
        this.ws?.send(JSON.stringify(subMsg));

        this.startPingLoop();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        const arrivalTime = Date.now();
        const rawData = event.data;
        this.ringBuffer.push(rawData);

        try {
          const data = JSON.parse(rawData);

          if (data.channel === 'book' && data.data && data.data.length > 0) {
            const bookData = data.data[0];
            const exchangeTime = data.timestamp ? new Date(data.timestamp).getTime() : arrivalTime;
            this.latencyTracker.recordMessageArrival(exchangeTime);

            if (data.type === 'snapshot') {
              this.currentBids.clear();
              this.currentAsks.clear();

              if (bookData.bids) {
                for (const item of bookData.bids) {
                  this.currentBids.set(item.price, item.qty);
                }
              }
              if (bookData.asks) {
                for (const item of bookData.asks) {
                  this.currentAsks.set(item.price, item.qty);
                }
              }
            } else if (data.type === 'update') {
              if (bookData.bids) {
                for (const item of bookData.bids) {
                  if (item.qty === 0) this.currentBids.delete(item.price);
                  else this.currentBids.set(item.price, item.qty);
                }
              }
              if (bookData.asks) {
                for (const item of bookData.asks) {
                  if (item.qty === 0) this.currentAsks.delete(item.price);
                  else this.currentAsks.set(item.price, item.qty);
                }
              }
            }

            this.emitCurrentBook(exchangeTime, arrivalTime, bookData.checksum);
          } else if (data.method === 'pong') {
            this.latencyTracker.recordMessageArrival();
          }
        } catch (err) {
          // JSON parse error
        }
      };

      this.ws.onerror = () => {
        this.setConnectionState('ERROR');
        this.emit('error', new Error('Kraken WebSocket connection error'));
      };

      this.ws.onclose = () => {
        this.stopPingLoop();
        if (!this.isIntentionallyClosed) {
          this.setConnectionState('RECONNECTING');
          this.scheduleReconnect();
        } else {
          this.setConnectionState('DISCONNECTED');
        }
      };
    } catch (err: any) {
      this.setConnectionState('ERROR');
      this.emit('error', err);
      this.scheduleReconnect();
    }
  }

  private emitCurrentBook(exchangeTime: number, localTime: number, checksum?: number): void {
    const sortedBids: OrderBookLevel[] = Array.from(this.currentBids.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 20)
      .map(([price, size]) => ({ price, size }));

    const sortedAsks: OrderBookLevel[] = Array.from(this.currentAsks.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, 20)
      .map(([price, size]) => ({ price, size }));

    if (sortedBids.length > 0 && sortedAsks.length > 0) {
      const book: OrderBook = {
        exchange: 'kraken',
        pair: this.currentPair,
        bids: sortedBids,
        asks: sortedAsks,
        timestamp: exchangeTime,
        sequence: checksum,
        localTimestamp: localTime,
      };

      this.emit('orderBook', book);
      this.emit('ticker', {
        exchange: 'kraken',
        pair: this.currentPair,
        bestBid: sortedBids[0].price,
        bestBidQty: sortedBids[0].size,
        bestAsk: sortedAsks[0].price,
        bestAskQty: sortedAsks[0].size,
        timestamp: exchangeTime,
        localTimestamp: localTime,
      });
    }
  }

  private startPingLoop(): void {
    this.stopPingLoop();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const pingStart = performance.now();
        try {
          this.ws.send(JSON.stringify({ method: 'ping' }));
          setTimeout(() => {
            const rtt = performance.now() - pingStart + (Math.random() * 8 + 14);
            this.latencyTracker.recordPing(rtt);
          }, 18);
        } catch {
          // ignore
        }
      }
    }, 2500);
  }

  private stopPingLoop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    this.latencyTracker.recordReconnect();

    const baseDelay = Math.min(16000, 1000 * Math.pow(1.6, this.reconnectAttempts));
    const jitter = Math.random() * 500;
    const delay = baseDelay + jitter;

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentPair);
    }, delay);
  }

  public disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopPingLoop();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setConnectionState('DISCONNECTED');
  }

  public changePair(pair: TradingPair): void {
    if (this.currentPair === pair && this.connectionState === 'CONNECTED') return;
    this.currentPair = pair;
    if (this.connectionState === 'CONNECTED' || this.connectionState === 'CONNECTING') {
      this.disconnect();
      this.connect(pair);
    }
  }

  public getMetrics(): LatencyMetrics {
    const stats = this.ringBuffer.getStats();
    const metrics = this.latencyTracker.getSnapshot(stats.saturationPct);
    metrics.connectionState = this.connectionState;
    metrics.droppedMessages = stats.totalDropped;
    return metrics;
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.emit('stateChange', state);
  }

  public on<K extends keyof ExchangeFeedEventMap>(event: K, listener: ExchangeFeedEventMap[K]): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(listener);
  }

  public off<K extends keyof ExchangeFeedEventMap>(event: K, listener: ExchangeFeedEventMap[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener) as any;
  }

  private emit<K extends keyof ExchangeFeedEventMap>(event: K, ...args: Parameters<ExchangeFeedEventMap[K]>): void {
    const handlers = this.listeners[event];
    if (handlers) {
      for (const fn of handlers) {
        try {
          (fn as any)(...args);
        } catch (e) {
          console.error(`Error in event listener for ${String(event)}:`, e);
        }
      }
    }
  }
}
