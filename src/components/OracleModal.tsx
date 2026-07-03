"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/market";

interface Quote {
  base: number;
  price: number;
  multiplier: number;
  demand: number;
  verdict: string;
  factors: string[];
  source: "model" | "fallback";
}

const BASE = 4;
const TAKE = 0.12; // house commission on every settlement

const EXAMPLES = [
  "Съел шаурму за 300 тенге 20 минут назад",
  "Выпил три эспрессо перед созвоном",
  "Всё спокойно, просто планирую день",
];

export default function OracleModal() {
  const [open, setOpen] = useState(false);
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Count-up animation for the headline figure.
  const [shown, setShown] = useState(BASE);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!quote) return;
    const from = shown;
    const to = quote.price;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setShown(from + (to - from) * eased);
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function launch() {
    setSituation("");
    setQuote(null);
    setError(null);
    setShown(BASE);
    setOpen(true);
  }

  async function appraise() {
    const text = situation.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setShown(BASE);
    setQuote(null);
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "The desk is unavailable.");
      } else {
        setQuote(data as Quote);
      }
    } catch {
      setError("The desk is unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-solid oracle-launch" onClick={launch}>
        Describe your situation
      </button>

      {open && (
        <div
          className="name-overlay oracle-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="The Oracle"
          onClick={() => setOpen(false)}
        >
          <div className="name-card oracle-card" onClick={(e) => e.stopPropagation()}>
            <button className="oracle-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>

            <span className="eyebrow centered">The Oracle</span>
            <h2 className="name-title">
              Describe your <em>situation</em>.
            </h2>
            <p className="name-sub">
              The desk reads it, quantifies your demand, and quotes your access — to the cent.
              Candour is efficient.
            </p>

            <textarea
              className="pf-input oracle-textarea"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") appraise();
              }}
              placeholder="Опишите вашу ситуацию…"
              aria-label="Describe your situation"
              maxLength={600}
              rows={3}
              autoFocus
            />

            <div className="oracle-examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="oracle-ex mono"
                  onClick={() => setSituation(ex)}
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>

            <button
              className="btn btn-solid"
              onClick={appraise}
              disabled={loading || !situation.trim()}
              style={{ width: "100%" }}
            >
              {loading ? "Appraising…" : "Get quoted"}
            </button>

            {error && <p className="oracle-error mono">{error}</p>}

            {quote && (
              <div className="oracle-result on" aria-live="polite" style={{ width: "100%" }}>
                <div className="oracle-quote">
                  <span className="oracle-base mono">Base {money(BASE)}</span>
                  <span className="oracle-figure mono">{money(shown)}</span>
                  <span className="oracle-unit">your access, quoted</span>
                </div>

                <div className="oracle-badges">
                  <span className="oracle-mult mono">×{quote.multiplier.toFixed(2)} revaluation</span>
                  <span className="oracle-demand mono">Demand {quote.demand}/100</span>
                </div>

                <div className="oracle-meter" aria-hidden="true">
                  <div className="oracle-meter-fill" style={{ width: `${quote.demand}%` }} />
                </div>

                <div className="oracle-take">
                  <span className="oracle-take-k mono">FlushPass commission · 12%</span>
                  <span className="oracle-take-v mono">{money(quote.price * TAKE)} to the house</span>
                </div>

                <p className="oracle-verdict">{quote.verdict}</p>

                {quote.factors.length > 0 && (
                  <div className="oracle-factors">
                    {quote.factors.map((f) => (
                      <span key={f} className="oracle-chip mono">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <p className="oracle-fine mono">
                  Appraised by {quote.source === "model" ? "the Oracle (GPT-4o-mini)" : "the Oracle (offline desk)"} ·
                  indicative · settles T+0 · non-refundable
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
