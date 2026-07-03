// ToiletDAO booking engine — all client-side, no backend.
// Dynamic slot pricing, urgency premium, Rush-Hour surge, Toilet Score.
import { priceForHours } from "./market";

export type CabinId = "A" | "B";
export type CabinStatus = "available" | "reserved" | "occupied";

export interface Cabin {
  id: CabinId;
  name: string;
  designation: string;
  liquidity: string; // marketing descriptor
}

export const CABINS: Cabin[] = [
  { id: "A", name: "Cabin A", designation: "North Wing · Floor 3", liquidity: "Prime liquidity" },
  { id: "B", name: "Cabin B", designation: "South Wing · Floor 3", liquidity: "Deep book" },
];

export const RUSH = { startMin: 9 * 60, endMin: 9 * 60 + 15, multiplier: 5 } as const;

/** A slot falls in the Rush-Hour band (09:00–09:15 local) → ×5. */
export function isRushSlot(slotMs: number): boolean {
  const d = new Date(slotMs);
  const min = d.getHours() * 60 + d.getMinutes();
  return min >= RUSH.startMin && min < RUSH.endMin;
}

/** Live-ish cabin status derived from a slowly advancing clock. */
export function deriveStatus(cabin: CabinId, nowMs: number): CabinStatus {
  const cycle: CabinStatus[] = ["available", "occupied", "reserved", "available"];
  const phase = Math.floor(nowMs / 7000) + (cabin === "A" ? 0 : 2);
  return cycle[((phase % 4) + 4) % 4];
}

export function urgencyMultiplier(urgency: number): number {
  // 1 → ×1.00, 10 → ×1.90 (you pay a premium for admitting you can't wait)
  return 1 + (urgency - 1) * 0.1;
}

export interface Quote {
  base: number;
  urgencyMult: number;
  rush: boolean;
  rushMult: number;
  total: number;
}

/** Live quote for a slot `hoursAhead` from now, at a given urgency. */
export function quote(hoursAhead: number, urgency: number, slotMs: number): Quote {
  const base = priceForHours(hoursAhead);
  const uMult = urgencyMultiplier(urgency);
  const rush = isRushSlot(slotMs);
  const rMult = rush ? RUSH.multiplier : 1;
  const total = Math.round(base * uMult * rMult * 100) / 100;
  return { base: Math.round(base * 100) / 100, urgencyMult: Math.round(uMult * 100) / 100, rush, rushMult: rMult, total };
}

// ---------------- Toilet Score & rank ----------------
export type Rank = "Bronze" | "Gold" | "Sovereign";

export interface RankInfo {
  rank: Rank;
  next: Rank | null;
  toNext: number; // points to next tier
  floor: number;
  ceil: number;
}

export function rankFor(score: number): RankInfo {
  if (score >= 880) return { rank: "Sovereign", next: null, toNext: 0, floor: 880, ceil: 1000 };
  if (score >= 700) return { rank: "Gold", next: "Sovereign", toNext: 880 - score, floor: 700, ceil: 880 };
  return { rank: "Bronze", next: "Gold", toNext: 700 - score, floor: 400, ceil: 700 };
}

export const SCORE = {
  start: 742,
  checkIn: 18,
  burn: 46,
  resell: 6,
  min: 400,
  max: 1000,
} as const;

export function clampScore(n: number): number {
  return Math.max(SCORE.min, Math.min(SCORE.max, Math.round(n)));
}

// ---------------- Persisted state ----------------
export type BookingStatus = "active" | "checkedin" | "burned" | "resold";

export interface Booking {
  id: string;
  cabin: CabinId;
  slotMs: number; // when the slot opens
  createdMs: number;
  price: number;
  urgency: number;
  rush: boolean;
  status: BookingStatus;
  resalePrice?: number;
}

export interface WalletState {
  score: number;
  bookings: Booking[]; // most-recent first
  settledValue: number; // lifetime $ cleared
}

const KEY = "wc-wallet-v1";

export function defaultWallet(): WalletState {
  return { score: SCORE.start, bookings: [], settledValue: 0 };
}

export function loadWallet(): WalletState {
  if (typeof window === "undefined") return defaultWallet();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultWallet();
    const parsed = JSON.parse(raw) as WalletState;
    if (!parsed || typeof parsed.score !== "number" || !Array.isArray(parsed.bookings)) {
      return defaultWallet();
    }
    return parsed;
  } catch {
    return defaultWallet();
  }
}

export function saveWallet(w: WalletState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(w));
  } catch {
    /* storage unavailable — degrade to in-memory */
  }
}

// ---------------- Live ticker feed ----------------
export interface Tick {
  cabin: string;
  surge: string;
  bookings: number;
  mid: string;
}

/** Deterministic-ish ticker seeded by a slowly advancing step. */
export function tickerFeed(step: number): Tick[] {
  const s = (n: number) => (Math.sin(step * 0.6 + n) + 1) / 2; // 0..1
  return [
    { cabin: "Cabin A", surge: `${(2.4 + s(1) * 2.6).toFixed(1)}×`, bookings: 11 + Math.floor(s(2) * 9), mid: `$${(30 + s(3) * 22).toFixed(2)}` },
    { cabin: "Cabin B", surge: `${(1.8 + s(4) * 2.1).toFixed(1)}×`, bookings: 7 + Math.floor(s(5) * 8), mid: `$${(24 + s(6) * 18).toFixed(2)}` },
  ];
}

export function money(n: number, dp = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}

export function fmtClock(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtWhen(ms: number, nowMs: number): string {
  const diff = ms - nowMs;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (diff < 60_000) return "now";
  if (h <= 0) return `in ${m}m`;
  if (h < 24) return `in ${h}h ${m}m`;
  const d = Math.floor(h / 24);
  return `in ${d}d ${h % 24}h`;
}
