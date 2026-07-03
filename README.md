# ToiletDAO — The Occupancy Exchange (WC.exit)

> We tokenized the one resource you can't postpone.

Landing page for the **"Worst Startup Ever"** hackathon (nFactorial). A dead-serious,
Series-A–grade fintech site for a deliberately useless product: a **dynamic exchange for
restroom access** — surge-priced toilet slots, a live order book, and a full derivatives
stack, all played completely straight.

The comedy is in the deadpan venture-speak, never the plumbing.

## The signature feature (really works)

A live, client-side **order book** for a single asset (`TOILET#14 · FL3`): an ask ladder
priced by time-to-slot (`48h=$10 → 1h=$100`, with a `RUSH ×5` band), a rolling odometer
mid-price, a next-free countdown, and an **Urgency Slider (1–10)** that reprices your
"panic premium" in real time. No backend — it runs on a seeded random walk, so it's live
on stage yet reproducible for screenshots.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

## Deploy (do this before the pitch — localhost-only costs −10)

Fastest path, no config:

```bash
npm i -g vercel
vercel            # first run: log in + link the project
vercel --prod     # deploys; prints a public https:// URL
```

Or push to GitHub and click **Import** at [vercel.com/new](https://vercel.com/new) — it
auto-detects Next.js. It's a fully static export, so any host (Netlify, Cloudflare Pages)
works too.

## Stack

- **Next.js 16** (App Router) + **Tailwind v4**
- **Archivo** (display) / **IBM Plex Sans** (body) / **IBM Plex Mono** (data) via `next/font`
- Light + dark themes, fully responsive, `prefers-reduced-motion` safe
- No external services — deploys as static content

## Where things live

| Path | What |
|------|------|
| `src/app/page.tsx` | Section assembly |
| `src/app/globals.css` | Design tokens + all component styles |
| `src/components/ToiletTerminal.tsx` | Live order book + urgency slider (signature) |
| `src/components/OccupancyMap.tsx` | Live floor heatmap |
| `src/lib/copy.ts` | All copy (edit the jokes here) |
| `src/lib/market.ts` | Pricing curve + seeded market sim |

Past occupancy is not indicative of future results.
