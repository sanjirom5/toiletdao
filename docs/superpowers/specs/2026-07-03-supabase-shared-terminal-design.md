# Supabase Shared Terminal — live names + occupancy

**Date:** 2026-07-03
**Scope:** Minimal. Make two things shared across all visitors in real time: (1) an
ordered roster of member names, (2) who currently occupies each toilet. Everything
else (price sim, meter, spend) stays local, per browser.

## Requirements (from the user)

- Names ordered in real time, visible to everyone.
- Visible who has occupied each toilet, live.
- Nothing more (no presence/online-count, no activity feed, no shared pricing).

## Design: one table, one subscription

A single Supabase table serves both requirements. Every browser subscribes to it and
re-renders on any change.

```sql
create table public.members (
  id        uuid primary key,        -- generated in the browser (localStorage)
  name      text not null,
  stall     text check (stall in ('1','2')),  -- which toilet held, or null
  held_at   timestamptz,             -- when the hold began (stale-hold cleanup)
  joined_at timestamptz not null default now()
);
create unique index one_per_stall on public.members (stall) where stall is not null;
alter table public.members enable row level security;
create policy "anon all" on public.members for all using (true) with check (true);
alter publication supabase_realtime add table public.members;
```

- **Ordered names** = `select … order by joined_at`.
- **Who occupied** = rows where `stall` is set → shown on the two toilet cards.
- **One-per-toilet** = the partial unique index; a losing concurrent reserve gets an
  error and simply doesn't take the seat.
- **Stuck-toilet guard** = a hold older than 3 min is treated as released, and a 30s
  sweep clears such rows so a closed tab never freezes a toilet.

## Security

Permissive RLS (anon key can read/write) — standard for a hackathon. A production build
would move writes behind auth or an edge function. Documented, accepted.

## Architecture

| File | Role |
|------|------|
| `src/lib/supabaseClient.ts` | browser client from env (null if unset) + `isSupabaseConfigured` + `getClientId()` (uuid in localStorage) |
| `src/lib/useMembers.ts` | subscribe to `members`, expose ordered roster + `occupancy` + `join()` + `setStall()` |
| `src/lib/usePlatform.ts` | consumes `useMembers`; **real occupancy replaces the simulation** when configured; drives price demand-spike, meter, reserve/end |
| `src/components/market/MarketBoard.tsx` | renders the roster + "enter the book" join field |
| `src/components/market/StallTicker.tsx` | shows the real occupant's name |
| `supabase/schema.sql` | the SQL above (run once) |
| `.env.local.example` | env template |

## Data flow

1. Enter a name (join field, or the reserve prompt) → `upsert` my row → I appear in
   everyone's ordered roster.
2. Reserve a toilet → `update` my row's `stall` (+ `held_at`). The unique index means a
   simultaneous grab by two people → one wins, the other is a no-op ("just taken").
3. Everyone's browser gets the realtime change → toilet cards + roster update live.
4. End → set `stall` back to null. My meter/bill/spend are computed and stored locally.

**Local vs shared:** price chart, the floating meter, and lifetime spend stay client-side
(each browser simulates price independently). Only names + occupancy cross the network.
The price **demand-spike now reacts to real occupancy** — when anyone takes a toilet, the
price jumps for everyone.

## Graceful fallback

If `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` are absent, `supabase` is null,
`isSupabaseConfigured` is false, and the terminal runs exactly as before (local +
simulated member, roster hidden). The app never breaks without keys, and `npm run build`
passes with no env.

## Setup (user-provided)

1. Create a free Supabase project → Project URL + anon public key.
2. Run `supabase/schema.sql` in the SQL editor.
3. `.env.local` locally + the same two vars in Vercel → redeploy.

## Verification

- `npm run build` passes with no env (fallback path).
- With keys: two browsers — name in one appears in the other's roster; reserving a toilet
  in one shows "In use · <name>" in the other; ending frees it everywhere; a second
  browser can't take an already-held toilet.

## Out of scope / follow-ups

- Shared pricing across clients (would need a server tick).
- Auth-scoped RLS. Presence/online-count. Activity feed.
