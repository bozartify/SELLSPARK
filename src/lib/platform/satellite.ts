/**
 * SellSpark Satellite & Offline-First Edge
 * Starlink / Kuiper / Iridium routing hints, store-and-forward queue
 * for disconnected creators, and geospatial CDN optimization.
 */

export type SatNet = 'starlink' | 'kuiper' | 'iridium' | 'oneweb';

export function bestSatNetwork(lat: number, _lng: number): SatNet {
  if (Math.abs(lat) > 55) return 'iridium';
  if (Math.abs(lat) > 45) return 'starlink';
  return 'starlink';
}

export function expectedLatencyMs(net: SatNet): number {
  return { starlink: 35, kuiper: 40, iridium: 750, oneweb: 70 }[net];
}

interface Queued { id: string; payload: unknown; enqueuedAt: number; attempts: number }

export class StoreAndForward {
  private queue: Queued[] = [];
  private maxAttempts = 10;
  enqueue(payload: unknown): string {
    const id = `sf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    this.queue.push({ id, payload, enqueuedAt: Date.now(), attempts: 0 });
    return id;
  }
  async drain(sender: (p: unknown) => Promise<boolean>): Promise<{ sent: number; failed: number }> {
    let sent = 0, failed = 0;
    for (const q of [...this.queue]) {
      q.attempts++;
      const ok = await sender(q.payload).catch(() => false);
      if (ok) { this.queue = this.queue.filter((x) => x.id !== q.id); sent++; }
      else if (q.attempts >= this.maxAttempts) { this.queue = this.queue.filter((x) => x.id !== q.id); failed++; }
    }
    return { sent, failed };
  }
  size(): number { return this.queue.length; }
}
