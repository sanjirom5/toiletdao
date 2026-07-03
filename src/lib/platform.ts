// Single-instrument platform state for the real nFactorial cabin.
// All client-side; syncs across tabs via storage events + a custom event.

export interface Session {
  name: string;
  since: number;
}

export interface Reservation {
  by: string;
  slotMs: number;
  price: number;
  urgency: number;
  createdMs: number;
  checkedIn: boolean;
  occupiedUntil?: number;
}

export type CabinStatus = "available" | "booked" | "occupied";

export const CABIN = {
  name: "nFactorial · Cabin 01",
  location: "3rd floor · by the kitchen",
  occupyMs: 4 * 60 * 1000, // in-use window after check-in (demo: 4 min)
} as const;

const SESSION_KEY = "wc-session";
const CABIN_KEY = "wc-cabin";
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
    /* storage unavailable */
  }
}

export function loadSession(): Session | null {
  return read<Session>(SESSION_KEY);
}
export function saveSession(s: Session | null): void {
  write(SESSION_KEY, s);
}

export function loadReservation(): Reservation | null {
  return read<Reservation>(CABIN_KEY);
}
export function saveReservation(r: Reservation | null): void {
  write(CABIN_KEY, r);
}

export function statusOf(r: Reservation | null, nowMs: number): CabinStatus {
  if (!r) return "available";
  if (r.checkedIn && r.occupiedUntil && nowMs < r.occupiedUntil) return "occupied";
  if (r.checkedIn) return "available"; // occupancy window elapsed
  return "booked";
}
