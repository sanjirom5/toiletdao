"use client";

import { useEffect, useState } from "react";
import { tickerFeed } from "@/lib/booking";

export default function Ticker() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => s + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const feed = tickerFeed(step);
  // Build a repeating list long enough for a seamless marquee.
  const items = [...feed, ...feed, ...feed, ...feed, ...feed, ...feed];

  return (
    <div className="ticker" role="marquee" aria-label="Live liquidity ticker">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-label">{t.cabin}</span>
            <span className="ticker-surge">{t.surge}</span>
            <span>{t.bookings} bookings today</span>
            <span className="ticker-label">Mid</span>
            <span>{t.mid}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
