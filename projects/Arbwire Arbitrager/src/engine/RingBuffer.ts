/**
 * High-Performance Bounded Circular Ring Buffer for Zero-GC Tick Streaming
 * 
 * Provides O(1) push and pop operations with bounded memory allocation.
 * Tracks queue saturation and drops oldest/newest elements during high backpressure spikes
 * to guarantee that the UI and analytics engines never experience memory leaks.
 */

export interface RingBufferStats {
  capacity: number;
  size: number;
  saturationPct: number;
  totalPushed: number;
  totalDropped: number;
}

export class RingBuffer<T> {
  private buffer: (T | null)[];
  private capacity: number;
  private head: number = 0; // Read pointer
  private tail: number = 0; // Write pointer
  private count: number = 0;
  private totalPushed: number = 0;
  private totalDropped: number = 0;

  constructor(capacity: number = 2048) {
    if (capacity <= 0) throw new Error('RingBuffer capacity must be positive');
    this.capacity = capacity;
    this.buffer = new Array<T | null>(capacity).fill(null);
  }

  /**
   * Enqueue an element into the buffer.
   * If the buffer is full, it drops the oldest item (eviction) to preserve real-time recency.
   * @returns true if added without drop, false if oldest was dropped
   */
  public push(item: T): boolean {
    let dropped = false;
    if (this.count === this.capacity) {
      // Overwrite oldest item: advance head
      this.head = (this.head + 1) % this.capacity;
      this.count--;
      this.totalDropped++;
      dropped = true;
    }

    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    this.totalPushed++;

    return !dropped;
  }

  /**
   * Dequeue the oldest element.
   * @returns item or null if empty
   */
  public pop(): T | null {
    if (this.count === 0) return null;

    const item = this.buffer[this.head];
    this.buffer[this.head] = null; // Free reference for GC
    this.head = (this.head + 1) % this.capacity;
    this.count--;

    return item;
  }

  /**
   * Drain all items currently in the buffer into an array.
   */
  public drain(): T[] {
    const items: T[] = [];
    while (this.count > 0) {
      const item = this.pop();
      if (item !== null) {
        items.push(item);
      }
    }
    return items;
  }

  /**
   * Peek the newest element without removing it.
   */
  public peekLatest(): T | null {
    if (this.count === 0) return null;
    const index = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[index];
  }

  /**
   * Peek the oldest element without removing it.
   */
  public peekOldest(): T | null {
    if (this.count === 0) return null;
    return this.buffer[this.head];
  }

  public size(): number {
    return this.count;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public isFull(): boolean {
    return this.count === this.capacity;
  }

  public clear(): void {
    this.buffer.fill(null);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  public getStats(): RingBufferStats {
    return {
      capacity: this.capacity,
      size: this.count,
      saturationPct: Number(((this.count / this.capacity) * 100).toFixed(1)),
      totalPushed: this.totalPushed,
      totalDropped: this.totalDropped,
    };
  }
}
