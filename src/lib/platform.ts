// nFactorial Bathroom — live access market model + persistence.
// Two toilets ("stalls"), each a tradeable instrument. All client-side;
// name / spend / occupancy sync across tabs via storage + a custom event.

export type StallId = "1" | "2";

export interface Stall {
  id: StallId;
  name: string; // "Stall 1"
  ticker: string; // "NFB·1"
  designation: string; // location line
  base: number; // base $/min the price mean-reverts toward
  vol: number; // random-walk volatility
  min: number; // price floor (pre-surge)
  max: number; // price ceiling (pre-surge)
  seed: number; // PRNG seed for the initial (deterministic) chart
}

export const VENUE = "nFactorial Bathroom";

export const STALLS: Stall[] = [
  { id: "1", name: "Stall 1", ticker: "NFB·1", designation: `${VENUE} · Floor 3 · by the window`, base: 3.5, vol: 0.5, min: 1.5, max: 9, seed: 1337 },
  { id: "2", name: "Stall 2", ticker: "NFB·2", designation: `${VENUE} · Floor 3 · by the door`, base: 4.2, vol: 0.78, min: 1.5, max: 9, seed: 7331 },
];

/** A live, metered occupation of a stall by the current member. */
export interface Occupancy {
  stall: StallId;
  by: string; // trader name at reservation time
  startedMs: number; // meter start
  accrued: number; // $ accrued so far (floats with the live rate)
  lastTickMs: number; // last accrual tick — for resume-after-reload math
}

export interface MarketState {
  spend: number; // lifetime $ settled
  occupancy: Occupancy | null;
}

const NAME_KEY = "wc-trader-name";
const MARKET_KEY = "wc-market";
export const PLATFORM_EVENT = "wc-platform-change";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(PLATFORM_EVENT));
  } catch {
    /* storage unavailable — degrade to in-memory */
  }
}

export function loadName(): string | null {
  return read<string>(NAME_KEY);
}
export function saveName(name: string | null): void {
  write(NAME_KEY, name);
}

export function defaultMarket(): MarketState {
  return { spend: 0, occupancy: null };
}

export function loadMarket(): MarketState {
  const m = read<MarketState>(MARKET_KEY);
  if (!m || typeof m.spend !== "number") return defaultMarket();
  return { spend: m.spend, occupancy: m.occupancy ?? null };
}
export function saveMarket(m: MarketState): void {
  write(MARKET_KEY, m);
}
