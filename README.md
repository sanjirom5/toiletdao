# WC.exit — The Private Exchange for Restroom Access

> We do not sell restroom access. We price the certainty of it.

A "Worst Startup Ever" hackathon entry (nFactorial): a dynamic, surge-priced
exchange for restroom access, presented with a completely straight face in a
private-banking / haute-horlogerie register. Obsidian and aged gold, serif
display, hairlines instead of cards.

## Two surfaces

- **`/` — the institution.** Opens on a scroll-driven **3D golden toilet** (Three.js /
  react-three-fiber): it rotates as you scroll, the lid tips open, and the camera
  plunges *inside* the bowl before the site is revealed. Degrades gracefully to a
  static gold hero when WebGL is unavailable or reduced-motion is set. Then: hero, the
  two-cabin estate with live
  status, an interactive booking desk (price your access live), the doctrine,
  private-club membership tiers, FAQ. A member ledger tracks your Toilet Score.
- **`/reserve` — the terminal.** The actual product. Sign in, then book the one
  real **nFactorial cabin** for money (mock settlement). A prominent live panel
  shows whether it is **Available / Reserved / In use**, with a check-in
  countdown, forfeit-on-no-show, and auto-release. State persists in
  localStorage and syncs across tabs.

## How the pricing works

Every slot is priced by proximity: 48h out → $10, 24h → $20, 6h → $35, 1h → $100,
with a ×5 Rush-Hour band (09:00–09:15). An urgency slider (1–10) applies a
×1.0–×1.9 premium — you pay more to admit you can't wait. Non-arrival forfeits
the position and debits your Toilet Score (Bronze → Gold → Sovereign).

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000  (landing) and /reserve (terminal)
```

Production: `npm run build && npm run start`.

## Deploy (do this before the pitch — localhost-only costs −10)

```bash
npm i -g vercel
vercel --prod        # first run links the project; prints a public https:// URL
```

Auto-detects Next.js; deploys as static content, no env vars.

## A note on "shared" state

There is no backend: the cabin's booked/available state lives in `localStorage`
and syncs across **tabs of the same browser**. That's enough to demo the flow
live. True multi-device sync (jury phone sees the laptop's booking) would need a
backend — Supabase or Firebase would drop in cleanly against the same state
shape in `src/lib/platform.ts`.

## Where things live

| Path | What |
|------|------|
| `src/app/page.tsx` | Landing (institution) |
| `src/app/reserve/page.tsx` | Platform route (terminal) |
| `src/app/globals.css` | Design tokens + all component styles |
| `src/components/BookingDesk.tsx` | Landing's interactive booking demo |
| `src/components/Platform.tsx` | Terminal: sign-in + single-cabin booking |
| `src/lib/booking.ts` | Pricing, Toilet Score, ledger state |
| `src/lib/platform.ts` | Single-cabin session + reservation state |
| `src/lib/copy.ts` | All landing copy |

Positions in restroom access carry risk, including the total loss of composure.
