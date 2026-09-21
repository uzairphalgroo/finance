import { describe, it, expect } from 'vitest';
import { LatencyTracker, WelfordVariance } from '../LatencyMonitor';

describe('WelfordVariance', () => {
  it('should compute running mean and sample standard deviation accurately in O(1) space', () => {
    const welford = new WelfordVariance();
    const values = [10, 12, 23, 23, 16, 23, 21, 16];

    for (const val of values) {
      welford.update(val);
    }

    // Mean of values: 18.0
    expect(welford.getMean()).toBeCloseTo(18.0, 4);

    // Sample variance of [10, 12, 23, 23, 16, 23, 21, 16] = 27.42857
    expect(welford.getVariance()).toBeCloseTo(27.42857, 4);

    // Sample std dev = sqrt(27.42857) = 5.2372
    expect(welford.getStdDev()).toBeCloseTo(5.2372, 3);
  });

  it('should reset accurately', () => {
    const welford = new WelfordVariance();
    welford.update(50);
    welford.update(100);
    welford.reset();

    expect(welford.getMean()).toBe(0);
    expect(welford.getVariance()).toBe(0);
    expect(welford.getStdDev()).toBe(0);
  });
});

describe('LatencyTracker', () => {
  it('should record ping RTT and compute running min/max/avg', () => {
    const tracker = new LatencyTracker('binance');
    tracker.recordPing(15.2);
    tracker.recordPing(24.8);
    tracker.recordPing(18.0);

    const snapshot = tracker.getSnapshot(12.5);
    expect(snapshot.exchange).toBe('binance');
    expect(snapshot.minPingRttMs).toBe(15.2);
    expect(snapshot.maxPingRttMs).toBe(24.8);
    expect(snapshot.avgPingRttMs).toBeCloseTo(19.33, 1);
    expect(snapshot.queueSaturationPct).toBe(12.5);
  });
});
