"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mulberry32, money } from "@/lib/market";
import { occupancy } from "@/lib/copy";

type State = "vacant" | "reserved" | "occupied";

interface Stall {
  id: number;
  label: string;
  state: State;
  price: number;
}

const N = 24;
const SEED = 4242;

function priceFor(state: State, r: number): number {
  if (state === "occupied") return Math.round((58 + r * 44) * 100) / 100;
  if (state === "reserved") return Math.round((26 + r * 16) * 100) / 100;
  return Math.round((7 + r * 9) * 100) / 100;
}

function makeStalls(seed: number): Stall[] {
  const rand = mulberry32(seed);
  return Array.from({ length: N }, (_, i) => {
    const roll = rand();
    const state: State = roll < 0.34 ? "occupied" : roll < 0.6 ? "reserved" : "vacant";
    return {
      id: i,
      label: `#${String(i + 1).padStart(2, "0")}`,
      state,
      price: priceFor(state, rand()),
    };
  });
}

export default function OccupancyMap() {
  const initial = useMemo(() => makeStalls(SEED), []);
  const [stalls, setStalls] = useState<Stall[]>(initial);
  const [active, setActive] = useState<Stall | null>(null);
  const stepRef = useRef(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const step = stepRef.current++;
      const rand = mulberry32(SEED + step * 7);
      setStalls((prev) => {
        const next = [...prev];
        // flip 1–2 stalls per tick to a new state
        const flips = 1 + (rand() > 0.6 ? 1 : 0);
        for (let k = 0; k < flips; k++) {
          const idx = Math.floor(rand() * N);
          const roll = rand();
          const state: State =
            roll < 0.34 ? "occupied" : roll < 0.6 ? "reserved" : "vacant";
          next[idx] = { ...next[idx], state, price: priceFor(state, rand()) };
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const shown = active ?? null;

  return (
    <div className="occ-panel">
      <div className="occ-panel-head">
        <span>Floor 3 · {occupancy.heading}</span>
        <span>LIVE</span>
      </div>
      <div className="occ-grid" role="list">
        {stalls.map((s) => (
          <button
            key={s.id}
            type="button"
            role="listitem"
            className={`occ-cell occ-${s.state}`}
            onMouseEnter={() => setActive(s)}
            onFocus={() => setActive(s)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            aria-label={`Stall ${s.label}, ${s.state}, quote ${money(s.price)}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="occ-legend" aria-hidden="true">
        {occupancy.legend.map((l) => (
          <span key={l.key}>
            <i className={`occ-${l.key}`} style={{ borderRadius: 3 }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="occ-quote">
        {shown ? (
          <>
            <span>
              WC-{shown.label.replace("#", "")}·3F ·{" "}
              <span style={{ textTransform: "capitalize" }}>{shown.state}</span>
            </span>
            <span
              style={{
                color:
                  shown.state === "occupied"
                    ? "var(--vermilion)"
                    : shown.state === "reserved"
                    ? "var(--amber)"
                    : "var(--teal)",
                fontWeight: 600,
              }}
            >
              {money(shown.price)}
            </span>
          </>
        ) : (
          <span className="occ-quote-empty">Hover a stall to pull its quote →</span>
        )}
      </div>
    </div>
  );
}
