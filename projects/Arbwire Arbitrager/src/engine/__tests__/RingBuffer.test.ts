import { describe, it, expect } from 'vitest';
import { RingBuffer } from '../RingBuffer';

describe('RingBuffer', () => {
  it('should initialize with correct capacity and empty state', () => {
    const rb = new RingBuffer<number>(4);
    expect(rb.size()).toBe(0);
    expect(rb.isEmpty()).toBe(true);
    expect(rb.isFull()).toBe(false);
  });

  it('should push and pop items in FIFO order', () => {
    const rb = new RingBuffer<string>(5);
    rb.push('A');
    rb.push('B');
    rb.push('C');

    expect(rb.size()).toBe(3);
    expect(rb.pop()).toBe('A');
    expect(rb.pop()).toBe('B');
    expect(rb.pop()).toBe('C');
    expect(rb.pop()).toBeNull();
  });

  it('should drop the oldest element when capacity is exceeded to prevent memory leaks', () => {
    const rb = new RingBuffer<number>(3);
    expect(rb.push(1)).toBe(true);
    expect(rb.push(2)).toBe(true);
    expect(rb.push(3)).toBe(true);
    expect(rb.isFull()).toBe(true);

    // 4th item forces eviction of oldest (1)
    expect(rb.push(4)).toBe(false);
    expect(rb.size()).toBe(3);

    const stats = rb.getStats();
    expect(stats.totalDropped).toBe(1);
    expect(stats.totalPushed).toBe(4);
    expect(stats.saturationPct).toBe(100);

    // Remaining items should be 2, 3, 4
    expect(rb.pop()).toBe(2);
    expect(rb.pop()).toBe(3);
    expect(rb.pop()).toBe(4);
    expect(rb.pop()).toBeNull();
  });

  it('should support draining all elements', () => {
    const rb = new RingBuffer<number>(10);
    rb.push(10);
    rb.push(20);
    rb.push(30);

    const drained = rb.drain();
    expect(drained).toEqual([10, 20, 30]);
    expect(rb.size()).toBe(0);
    expect(rb.isEmpty()).toBe(true);
  });
});
