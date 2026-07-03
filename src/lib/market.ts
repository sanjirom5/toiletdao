// Deterministic market simulation for the Toilet Terminal.
// Seeded so the order book animates live but reproduces for screenshots.

/** mulberry32 — tiny deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Time-to-slot price curve. Anchored to the brief:
 * 48h=$10, 24h=$20, 6h=$35, 1h=$100. Log-linear interpolation between
 * anchors so price rises smoothly as the slot approaches (scarcity premium).
 */
const ANCHORS: Array<[number, number]> = [
  [48, 10],
  [24, 20],
  [6, 35],
  [1, 100],
];

export function priceForHours(hours: number): number {
  const h = Math.max(0.25, Math.min(72, hours));
  if (h >= 48) return 10;
  if (h <= 1) return 100;
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [h1, p1] = ANCHORS[i];
    const [h2, p2] = ANCHORS[i + 1];
    if (h <= h1 && h >= h2) {
      // interpolate in log space on both axes
      const t = (Math.log(h1) - Math.log(h)) / (Math.log(h1) - Math.log(h2));
      const p = Math.exp(Math.log(p1) + t * (Math.log(p2) - Math.log(p1)));
      return p;
    }
  }
  return 35;
}

export type Side = "ask" | "bid";

export interface Level {
  id: string;
  /** clock label for the slot, e.g. "09:11" */
  slot: string;
  price: number;
  /** normalized depth 0..1 for the depth bar */
  depth: number;
  rush?: boolean;
}

export interface Book {
  asks: Level[];
  bids: Level[];
  mid: number;
  nextFreeSec: number;
}

function fmtClock(totalMin: number): string {
  const m = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Build a believable single-asset book. Asks are open time-slots priced by
 * time-to-slot (climbing toward 1h). Bids are self-reported demand below mid.
 * The 09:00–09:15 Rush Hour band clears at ×5.
 */
export function buildBook(rand: () => number, tick: number): Book {
  // base "now" anchored around 08:30 so the 09:00 rush is just ahead
  const nowMin = 8 * 60 + 30 + Math.floor((tick % 8) / 2);

  // asks: slots from ~40min out down to ~8min out
  const askOffsets = [172, 96, 61, 41, 26, 14];
  const asks: Level[] = askOffsets.map((off, i) => {
    const slotMin = nowMin + off;
    const hours = off / 60;
    const rush = slotMin >= 9 * 60 && slotMin <= 9 * 60 + 15;
    let price = priceForHours(hours);
    if (rush) price *= 5;
    // small live jitter
    price *= 1 + (rand() - 0.5) * 0.04;
    return {
      id: `ask-${i}`,
      slot: fmtClock(slotMin),
      price: Math.round(price * 100) / 100,
      depth: 0.35 + rand() * 0.6,
      rush,
    };
  });

  const mid =
    asks.length > 0
      ? Math.round((asks[asks.length - 1].price * 0.82) * 100) / 100
      : 34.2;

  // bids: demand below mid, descending
  const bids: Level[] = [0, 1, 2, 3].map((i) => {
    const slotMin = nowMin - (8 + i * 7);
    const price = Math.round((mid * (0.86 - i * 0.11) + (rand() - 0.5) * 1.2) * 100) / 100;
    return {
      id: `bid-${i}`,
      slot: fmtClock(slotMin),
      price: Math.max(4, price),
      depth: 0.3 + rand() * 0.65,
    };
  });

  const nextFreeSec = 372; // 06:12, ticks down via the component clock

  return { asks, bids, mid, nextFreeSec };
}

/** Your quoted fill given the live mid and self-reported urgency (1..10). */
export function quoteFill(mid: number, urgency: number): {
  price: number;
  premium: number;
  multiplier: number;
} {
  const multiplier = 1 + urgency * 0.09; // panic premium
  const price = Math.round(mid * multiplier * 100) / 100;
  const premium = Math.round((price - mid) * 100) / 100;
  return { price, premium, multiplier: Math.round(multiplier * 100) / 100 };
}

export function money(n: number, dp = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
