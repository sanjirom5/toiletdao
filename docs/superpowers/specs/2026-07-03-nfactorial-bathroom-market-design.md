# WC.exit — nFactorial Bathroom Live Access Market

**Date:** 2026-07-03
**Surface:** `/reserve` terminal only. The landing page (`/`) is explicitly out of scope and untouched.
**Status:** Approved design → build.

## Summary

Replace the single-cabin, sign-in-gated reservation console with a **live spot market** for the
two toilets in the *nFactorial Bathroom*. Each toilet ("stall") is a tradeable instrument with a
per-minute price that fluctuates every ~1 second like a stock chart. There is no login; a name is
requested only at the moment of first reservation. Reserving a stall starts a **floating meter**
that accrues cost at the *live* price while occupied. Lifetime spend replaces the old score/rank.

## Goals

- Remove the sign-in gate. Terminal opens straight to the market, browsable immediately.
- Two toilets, both in the **nFactorial Bathroom** venue: **Stall 1** (`NFB·1`), **Stall 2** (`NFB·2`).
- Each stall shows a live `$/min` price, % move, and a live line chart of recent price history.
- Reserve → name prompt (first time only, remembered) → **floating meter** accrues at the live rate.
- Header shows running **session spend** (replaces Toilet Score / Bronze-Gold-Sovereign).
- Stay client-side (localStorage + cross-tab sync). No backend.

## Non-goals (out of scope)

- The landing page `/` and its components (`BookingDesk`, `MemberLedger`, `Ticker`, `EstateStrip`,
  `SiteNav`) and their shared libs (`booking.ts`, `useWallet.ts`) — left as-is. This creates a known
  thematic drift between landing (old "score/hours" story) and terminal (new spot market); aligning
  the landing is a later follow-up.
- Real multi-device sync / backend (Supabase would drop in later against the same state shape).
- Actual speculation (buy-low/sell-high positions) — rejected during brainstorming.

## Architecture

Surgical rewrite confined to terminal-only modules. Verified import graph: `platform.ts` and
`usePlatform.ts` are imported **only** by `Platform.tsx`; safe to rewrite. `booking.ts`/`useWallet.ts`
are shared with the landing and must **not** change. `market.ts` is imported only by `booking.ts`
(`priceForHours`), so its unused order-book code is free to repurpose but `priceForHours` stays.

### Modules

| File | Change | Responsibility |
|------|--------|----------------|
| `src/lib/priceEngine.ts` | **new** | Pure price simulation: `nextPrice`, `isRushNow`, seed helpers, rolling buffer. Reuses `mulberry32`. No React, unit-testable. |
| `src/lib/platform.ts` | **rewrite** | Pure model + persistence: stall defs, `Occupancy` type, trader-name + session-spend + occupancy load/save, status derivation, meter math, cross-tab event. No React. |
| `src/lib/usePlatform.ts` | **rewrite** | React hook wiring it together: live price ticking, chart buffers, occupancy/meter, name capture, session spend, cross-tab sync. Drops `useWallet`/`SCORE`. |
| `src/components/Platform.tsx` | **rewrite** | Board layout + orchestration; header with session spend + name; inline name prompt. |
| `src/components/market/StallTicker.tsx` | **new** | One stall card: name, live price, % move, sparkline, reserve button / live meter + end-session. |
| `src/components/market/PriceChart.tsx` | **new** | Pure presentational SVG polyline over a `number[]` buffer. No deps. |
| `src/app/globals.css` | **append** | Styles for board, ticker cards, chart, meter, name prompt. Reuse existing design tokens. |
| `src/app/reserve/page.tsx` | **edit** | Update metadata copy (remove "sign in" language). |

## Data model & persistence (localStorage, client-side)

Keys (reuse `PLATFORM_EVENT` = `wc-platform-change` for cross-tab sync via storage + custom event):

- `wc-trader-name` → `string | null` — the member's name. Set on first reserve; never re-asked.
- `wc-market` → JSON `{ spend: number, occupancy: Occupancy | null }`

```ts
type StallId = "1" | "2";

interface Occupancy {
  stall: StallId;
  by: string;         // trader name at time of reservation
  startedMs: number;  // meter start
  accrued: number;    // $ accrued so far (floating)
  lastTickMs: number; // last accrual tick, for resume-after-reload math
}
```

Only **one** user occupancy at a time (you are one person). The *other* stall may show an ephemeral,
per-tab **simulated** occupancy to keep both tickers alive (see Price engine). Simulated occupancy is
not persisted.

**Cross-tab:** occupancy, trader name, and session spend are shared via localStorage + `PLATFORM_EVENT`.
The live price walk is simulated **per tab in-memory** (prices need not match across tabs exactly — it's
a sim); only state (name/spend/occupancy) is authoritative and synced.

## Price engine (`priceEngine.ts`)

Advances on a ~1s tick. Current price is derived/held in memory (React state), **not** persisted;
re-seeded on load so the chart is populated immediately and reproducible for screenshots.

Three layers combined per stall:

1. **Random walk** — `nextPrice(prev, volatility, rand)` nudges price by a small seeded step
   (mean-reverting toward the stall's base so it doesn't run away). Each stall has its own base +
   volatility "personality" (e.g. Stall 1 base `$3.50/min`, Stall 2 base `$4.20/min`, different vol).
   Clamp to a sane band (e.g. `$1.50`–`$9.00`, pre-surge).
2. **Demand premium** — a multiplier that jumps (e.g. →`1.5×`, rising) when the stall is occupied
   (by the user or a simulated member) and eases back toward `1.0×` while free.
3. **Rush Hour** — `isRushNow()` true during 09:00–09:15 local → market-wide `×5` comedic spike.

**Simulated demand (nice-to-have, cuttable):** on the stall the user is *not* in, periodically flip a
simulated "In use by another member" state for ~30–60s (seeded/periodic, no `Math.random`), driving a
demand spike then release — so both tickers feel like a live market in a single-user demo.

**Chart buffer:** rolling array of the last ~60 prices (one per tick ≈ 1 min of history). Pre-seed 60
points from the seeded walk on mount so the chart is never empty; append live, drop oldest.

**Reduced motion (`prefers-reduced-motion: reduce`):** pause the tick, hold price constant, render the
static seeded buffer. Meter still works — computed from `elapsed × held rate` on end. Keeps it
accessible and screenshot-stable (mirrors existing app conventions).

## Floating meter math

Bill accrues continuously at the live rate: over a tick of `dtMs`, `accrued += rate * (dtMs / 60000)`
(rate is `$/min`). So the total is the integral of the live price over the minutes occupied — the
market moving while you sit there changes what you owe. On reload mid-session, resume from persisted
`accrued` + `lastTickMs`, adding `currentRate * (now - lastTickMs)/60000` for the gap.

- Display: elapsed as `mm:ss`, running bill as `$` (2dp).
- **End session** → stop meter, release stall (occupancy → null), add final `accrued` to `spend`.

## User flow

1. Land on `/reserve` — no login. Two ticker cards, prices moving live.
2. Click a stall → **Reserve at $X.XX/min**.
3. First reservation ever → inline name prompt (saved; quiet "not you?" to change later). Subsequent
   reservations skip straight through.
4. Stall flips to **In use** (yours); floating meter starts; other reserve buttons disabled while you're in.
5. **End session** → meter stops, stall releases, total adds to header **session spend**.

Per-stall states: **Available / In use (yours) / In use (member)** [simulated]. Occupying blocks new reservations
(cross-tab aware).

## Removals (terminal only)

- Sign-in gate + `Session` auth model.
- Toilet Score / Bronze-Gold-Sovereign rank, `SCORE`, `clampScore`, `rankFor` usage in the terminal.
- Old "hours-ahead / urgency" slider + `quote()`-based reserve panel.
- Terminal's dependency on `useWallet.ts` (left intact for the landing).

## Testing / verification

- **Pure logic** (`priceEngine.ts` walk stays in band + mean-reverts; `isRushNow`; meter accrual
  integral; status derivation): unit-test if a runner exists; otherwise verify via the running app.
  (Pragmatic for a hackathon — no runner is currently configured.)
- **Behavior:** `npm run build` must pass (project uses a modified Next.js — heed `AGENTS.md`). Then
  drive `/reserve`: prices tick and chart animates; reserve triggers name prompt once; meter floats;
  end session adds to spend; reduced-motion holds static; cross-tab occupancy syncs.

## Open follow-ups (not now)

- Align the landing `/` with the new spot-market story.
- Optional backend for true multi-device market state.
