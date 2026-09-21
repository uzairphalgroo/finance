import type { ExchangeId, LatencyMetrics } from '../engine/types';


/**
 * Welford's algorithm for online calculation of mean and variance in O(1) space.
 * Ideal for streaming low-latency packet jitter without unbounded memory growth.
 */
export class WelfordVariance {
  private count: number = 0;
  private mean: number = 0;
  private M2: number = 0;

  public update(x: number): void {
    this.count++;
    const delta = x - this.mean;
    this.mean += delta / this.count;
    const delta2 = x - this.mean;
    this.M2 += delta * delta2;
  }

  public getMean(): number {
    return this.count === 0 ? 0 : this.mean;
  }

  public getVariance(): number {
    return this.count < 2 ? 0 : this.M2 / (this.count - 1);
  }

  public getStdDev(): number {
    return Math.sqrt(this.getVariance());
  }

  public reset(): void {
    this.count = 0;
    this.mean = 0;
    this.M2 = 0;
  }
}

/**
 * Real-time network and orderbook telemetry monitor per exchange venue.
 */
export class LatencyTracker {
  private exchange: ExchangeId;
  private lastArrivalTimestamp: number = 0;
  private jitterEstimator: WelfordVariance = new WelfordVariance();
  
  private pingHistory: number[] = [];
  private messageCountWindow: number = 0;
  private lastRateCalcTimestamp: number = performance.now();
  private currentMsgRate: number = 0;

  private totalMessages: number = 0;
  private droppedMessages: number = 0;
  private reconnectCount: number = 0;
  private lastPingRtt: number = 0;
  private orderBookDriftMs: number = 0;
  private lastMsgTimestamp: number = 0;

  constructor(exchange: ExchangeId) {
    this.exchange = exchange;
  }

  /**
   * Record a new packet arrival to compute inter-arrival jitter and message throughput.
   * @param exchangeMsgTimestamp Epoch timestamp from the exchange payload (if available)
   */
  public recordMessageArrival(exchangeMsgTimestamp?: number): void {
    const now = performance.now();
    this.totalMessages++;
    this.messageCountWindow++;
    this.lastMsgTimestamp = Date.now();

    if (this.lastArrivalTimestamp > 0) {
      const deltaT = now - this.lastArrivalTimestamp;
      // Filter out huge reconnection pauses from regular jitter variance
      if (deltaT < 5000) {
        this.jitterEstimator.update(deltaT);
      }
    }
    this.lastArrivalTimestamp = now;

    // Calculate order book drift (transit lag + clock skew)
    if (exchangeMsgTimestamp && exchangeMsgTimestamp > 0) {
      // Delta in ms
      const drift = Math.abs(Date.now() - exchangeMsgTimestamp);
      this.orderBookDriftMs = drift;
    }

    // Update messages/sec calculation every 500ms
    if (now - this.lastRateCalcTimestamp >= 500) {
      const elapsedSec = (now - this.lastRateCalcTimestamp) / 1000;
      this.currentMsgRate = Math.round(this.messageCountWindow / elapsedSec);
      this.messageCountWindow = 0;
      this.lastRateCalcTimestamp = now;
    }
  }

  /**
   * Record Ping RTT response time
   */
  public recordPing(rttMs: number): void {
    this.lastPingRtt = Math.max(0, rttMs);
    this.pingHistory.push(this.lastPingRtt);
    if (this.pingHistory.length > 50) {
      this.pingHistory.shift();
    }
  }

  public recordDrop(count: number = 1): void {
    this.droppedMessages += count;
  }

  public recordReconnect(): void {
    this.reconnectCount++;
  }

  public getSnapshot(queueSaturationPct: number = 0): LatencyMetrics {
    const sumPing = this.pingHistory.reduce((a, b) => a + b, 0);
    const avgPing = this.pingHistory.length > 0 ? sumPing / this.pingHistory.length : this.lastPingRtt;
    const minPing = this.pingHistory.length > 0 ? Math.min(...this.pingHistory) : this.lastPingRtt;
    const maxPing = this.pingHistory.length > 0 ? Math.max(...this.pingHistory) : this.lastPingRtt;

    return {
      exchange: this.exchange,
      connectionState: 'CONNECTED',
      pingRttMs: Math.round(this.lastPingRtt * 10) / 10,
      avgPingRttMs: Math.round(avgPing * 10) / 10,
      minPingRttMs: Math.round(minPing * 10) / 10,
      maxPingRttMs: Math.round(maxPing * 10) / 10,
      packetJitterMs: Math.round(this.jitterEstimator.getStdDev() * 100) / 100,
      msgPerSecond: this.currentMsgRate,
      totalMessages: this.totalMessages,
      droppedMessages: this.droppedMessages,
      queueSaturationPct: Math.round(queueSaturationPct * 10) / 10,
      lastMsgTimestamp: this.lastMsgTimestamp,
      orderBookDriftMs: Math.round(this.orderBookDriftMs),
      reconnectCount: this.reconnectCount,
    };
  }

  public reset(): void {
    this.jitterEstimator.reset();
    this.pingHistory = [];
    this.messageCountWindow = 0;
    this.lastRateCalcTimestamp = performance.now();
    this.currentMsgRate = 0;
    this.totalMessages = 0;
    this.droppedMessages = 0;
  }
}
