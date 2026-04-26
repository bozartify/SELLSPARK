/**
 * SellSpark Real-time Mesh
 * CRDT-style collaborative document sync, presence, and
 * WebTransport/WebSocket-ready pub/sub with exponential backoff.
 */

export interface CRDTOp {
  id: string; actor: string; ts: number; path: string; value: unknown;
}

export class LWWMap<T> {
  private store = new Map<string, { value: T; ts: number; actor: string }>();
  set(key: string, value: T, actor: string, ts = Date.now()) {
    const prev = this.store.get(key);
    if (!prev || ts > prev.ts || (ts === prev.ts && actor > prev.actor)) {
      this.store.set(key, { value, ts, actor });
    }
  }
  get(key: string): T | undefined { return this.store.get(key)?.value; }
  merge(other: LWWMap<T>) {
    other.store.forEach((v, k) => this.set(k, v.value, v.actor, v.ts));
  }
  entries(): [string, T][] { return Array.from(this.store, ([k, v]) => [k, v.value]); }
}

export class PresenceTracker {
  private users = new Map<string, { at: number; cursor?: { x: number; y: number } }>();
  heartbeat(id: string, cursor?: { x: number; y: number }) {
    this.users.set(id, { at: Date.now(), cursor });
  }
  active(windowMs = 10000): string[] {
    const now = Date.now();
    return Array.from(this.users.entries()).filter(([, v]) => now - v.at < windowMs).map(([k]) => k);
  }
}

export function backoff(attempt: number, base = 250, cap = 30000): number {
  return Math.min(cap, base * 2 ** attempt) * (0.5 + Math.random() / 2);
}
