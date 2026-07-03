"use client";

import { useEffect, useRef, useState } from "react";
import {
  mulberry32,
  buildBook,
  quoteFill,
  money,
  type Book,
} from "@/lib/market";
import { brand } from "@/lib/copy";

const SEED = 1337;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Digit odometer — non-digit characters render static. */
function Odometer({ value }: { value: string }) {
  return (
    <span className="odo" aria-hidden="true">
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="odo-col" key={i}>
            <span
              className="odo-strip"
              style={{ transform: `translateY(-${Number(ch)}em)` }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="odo-fixed" key={i}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

function fmtCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ToiletTerminal() {
  const [book, setBook] = useState<Book>(() => buildBook(mulberry32(SEED), 0));
  const [urgency, setUrgency] = useState(6);
  const [countdown, setCountdown] = useState(372); // 06:12
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});
  const bookRef = useRef(book);
  const tickRef = useRef(1);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    bookRef.current = book;
  }, [book]);

  // live order-book walk
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      const t = tickRef.current++;
      const prev = bookRef.current;
      const next = buildBook(mulberry32(SEED + t), t);
      const f: Record<string, "up" | "down"> = {};
      for (const a of next.asks) {
        const p = prev.asks.find((x) => x.id === a.id);
        if (p) f[a.id] = a.price >= p.price ? "up" : "down";
      }
      for (const b of next.bids) {
        const p = prev.bids.find((x) => x.id === b.id);
        if (p) f[b.id] = b.price >= p.price ? "up" : "down";
      }
      setBook(next);
      setFlash(f);
      window.setTimeout(() => setFlash({}), 480);
    }, 950);
    return () => clearInterval(id);
  }, [reduced]);

  // next-free countdown
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setCountdown((c) => (c <= 0 ? 372 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [reduced]);

  const quote = quoteFill(book.mid, urgency);
  const midStr = book.mid.toFixed(2);
  const fillStr = quote.price.toFixed(2);

  return (
    <div className="terminal" role="img" aria-label={`Live order book for ${brand.asset}. Mid price ${money(book.mid)}. Your quoted fill at urgency ${urgency} of 10 is ${money(quote.price)}.`}>
      <div className="term-head">
        <span className="term-dot-row" aria-hidden="true">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
        </span>
        <span className="term-asset mono">{brand.asset}</span>
        <span className="term-live mono">
          <span className="pulse" />
          LIVE
        </span>
      </div>

      <div className="term-colhead mono">
        <span>Slot · asks</span>
        <span>Price</span>
        <span>Depth</span>
      </div>

      <div className="term-ladder">
        {book.asks.map((a) => (
          <div
            key={a.id}
            className={`term-row ask${a.rush ? " rush" : ""}${
              flash[a.id] ? ` flash-${flash[a.id]}` : ""
            }`}
          >
            <span className="term-depth" style={{ width: `${a.depth * 100}%` }} />
            <span className="term-slot mono">{a.slot}</span>
            <span className="term-price mono">{money(a.price)}</span>
            <span className="term-tag mono">{a.rush ? "RUSH ×5" : "OPEN"}</span>
          </div>
        ))}
      </div>

      <div className="term-mid">
        <div>
          <div className="term-mid-label">Mid · {brand.asset}</div>
          <div className="term-mid-price mono">
            <span aria-hidden="true">$</span>
            <Odometer value={midStr} />
            <span className="sr-only">{money(book.mid)}</span>
          </div>
        </div>
        <div className="term-mid-right">
          <span className="term-countdown mono">next free {fmtCountdown(countdown)}</span>
        </div>
      </div>

      <div className="term-ladder">
        {book.bids.map((b) => (
          <div
            key={b.id}
            className={`term-row bid${flash[b.id] ? ` flash-${flash[b.id]}` : ""}`}
          >
            <span className="term-depth" style={{ width: `${b.depth * 100}%` }} />
            <span className="term-slot mono">{b.slot}</span>
            <span className="term-price mono">{money(b.price)}</span>
            <span className="term-tag mono" style={{ color: "var(--term-muted)" }}>
              BID
            </span>
          </div>
        ))}
      </div>

      <div className="term-urgency">
        <div className="term-urgency-top">
          <label className="term-urgency-label" htmlFor="urgency">
            Urgency — how badly do you need it?
          </label>
          <span className="term-urgency-val mono">{urgency} / 10</span>
        </div>
        <input
          id="urgency"
          className="urgency-range"
          type="range"
          min={1}
          max={10}
          step={1}
          value={urgency}
          onChange={(e) => setUrgency(Number(e.target.value))}
          aria-valuetext={`Urgency ${urgency} of 10, quoted fill ${money(quote.price)}`}
        />
        <div className="term-quote">
          <div>
            <div className="term-quote-label">Your quoted fill</div>
            <div className="term-quote-fill mono">
              <span aria-hidden="true">$</span>
              <Odometer value={fillStr} />
              <span className="sr-only">{money(quote.price)}</span>
            </div>
          </div>
          <div className="term-quote-meta mono">
            <div className="term-quote-prem">+{money(quote.premium)} panic premium</div>
            <div className="term-quote-mult">effective surge ×{quote.multiplier.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
