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

const EXAMPLES = [
  "Съел шаурму за 300 тенге 20 минут назад",
  "Выпил три эспрессо перед созвоном",
  "Всё спокойно, просто планирую день",
];

export default function Oracle() {
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

  async function appraise() {
    const text = situation.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setShown(BASE);
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "The desk is unavailable.");
        setQuote(null);
      } else {
        setQuote(data as Quote);
      }
    } catch {
      setError("The desk is unavailable. Try again.");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="oracle" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Oracle</span>
          <h2 className="display-title">
            Price your <em>urgency</em>.
          </h2>
          <p className="lede">
            Describe your situation. Our appraisal engine reads it, quantifies your demand, and
            revalues access in real time. Candour is efficient — the book compensates it.
          </p>
        </div>

        <div className="oracle-panel">
          <div className="oracle-form">
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
          </div>

          <div className={`oracle-result ${quote ? "on" : ""}`} aria-live="polite">
            <div className="oracle-quote">
              <span className="oracle-base mono">Base {money(BASE)}</span>
              <span className="oracle-figure mono">{money(shown)}</span>
              <span className="oracle-unit">your access, quoted</span>
            </div>

            {quote ? (
              <>
                <div className="oracle-badges">
                  <span className="oracle-mult mono">×{quote.multiplier.toFixed(2)} revaluation</span>
                  <span className="oracle-demand mono">Demand {quote.demand}/100</span>
                </div>

                <div className="oracle-meter" aria-hidden="true">
                  <div className="oracle-meter-fill" style={{ width: `${quote.demand}%` }} />
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
              </>
            ) : (
              <p className="oracle-placeholder mono">
                Awaiting disclosure. The book will revalue on submission.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
