// Pure price simulation for the nFactorial Bathroom market.
// No React, no persistence — just the math, so it's easy to reason about.
import { mulberry32 } from "./market";

/** Rush Hour: 09:00–09:15 local clears the whole market at ×5. */
export const RUSH = { startMin: 9 * 60, endMin: 9 * 60 + 15, mult: 5 } as const;

export function isRushNow(nowMs: number): boolean {
  const d = new Date(nowMs);
  const min = d.getHours() * 60 + d.getMinutes();
  return min >= RUSH.startMin && min < RUSH.endMin;
}

export function rushMult(nowMs: number): number {
  return isRushNow(nowMs) ? RUSH.mult : 1;
}

/**
 * One random-walk step. Mean-reverts toward `base` so the price wanders like a
 * stock without running away, plus a small seeded jitter. Clamped to the band.
 */
export function stepPrice(
  prev: number,
  base: number,
  vol: number,
  min: number,
  max: number,
  rand: () => number
): number {
  const reverted = prev + (base - prev) * 0.05;
  const jitter = (rand() - 0.5) * vol;
  const next = reverted + jitter;
  return Math.min(max, Math.max(min, Math.round(next * 100) / 100));
}

/** Ease a value toward a target (used for the demand premium). */
export function ease(cur: number, target: number, k = 0.15): number {
  return cur + (target - cur) * k;
}

/** Deterministically seed an initial chart buffer of `n` points. */
export function seedBuffer(
  n: number,
  base: number,
  vol: number,
  min: number,
  max: number,
  seed: number
): number[] {
  const rand = mulberry32(seed);
  const out: number[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    p = stepPrice(p, base, vol, min, max, rand);
    out.push(p);
  }
  return out;
}
