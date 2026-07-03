"use client";

import { useState } from "react";
import { usePlatform } from "@/lib/usePlatform";
import { STALLS, VENUE } from "@/lib/platform";
import StallTicker from "./StallTicker";

/**
 * The live access market — head, two stall tickers, fine print, and the
 * name-on-reserve overlay. Shared by the /reserve terminal and the landing.
 */
export default function MarketBoard({
  eyebrow = VENUE,
  title = "The live access market",
  headless = false,
}: {
  eyebrow?: string;
  title?: string;
  /** hide the head block (when the host section provides its own) */
  headless?: boolean;
}) {
  const p = usePlatform();
  const [nameDraft, setNameDraft] = useState("");

  if (!p.mounted) {
    return <div className="pf-loading mono">Opening the market…</div>;
  }

  return (
    <div className="market-shell">
      {!headless && (
        <div className="market-head">
          <img
            className="market-logo"
            src="/nfactorial.png"
            alt="nFactorial"
            width={64}
            height={64}
          />
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="market-title">{title}</h2>
          <div className={`surge-flag ${p.rush ? "on" : ""}`} aria-live="polite">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {p.rush ? "Rush-hour surge · ×5 revaluation" : "Standard revaluation · prices clearing live"}
          </div>
        </div>
      )}

      <div className="market-grid">
        {STALLS.map((cfg) => {
          const view = p.stalls.find((s) => s.id === cfg.id);
          if (!view) return null;
          const mine = p.occupancy?.stall === cfg.id;
          const holdsOther = !!p.occupancy && !mine;
          return (
            <StallTicker
              key={cfg.id}
              cfg={cfg}
              view={view}
              occupancy={mine ? p.occupancy : null}
              now={p.now}
              disabled={holdsOther}
              onReserve={() => p.reserve(cfg.id)}
              onEnd={p.endSession}
            />
          );
        })}
      </div>

      <p className="market-fine mono">
        Prices are indicative and settle in real time. Positions in restroom access carry risk,
        including the total loss of composure.
      </p>

      {p.namePromptFor && (
        <div className="name-overlay" role="dialog" aria-modal="true" onClick={p.cancelName}>
          <form
            className="name-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (nameDraft.trim()) {
                p.confirmName(nameDraft);
                setNameDraft("");
              }
            }}
          >
            <span className="eyebrow centered">Members&rsquo; entrance</span>
            <h2 className="name-title">
              A name for the <em>book</em>.
            </h2>
            <p className="name-sub">
              We attach your position to a name. No password, no account — reliability is the only
              credential we honour.
            </p>
            <input
              className="pf-input"
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              autoFocus
              maxLength={40}
            />
            <button className="btn btn-solid" type="submit" disabled={!nameDraft.trim()} style={{ width: "100%" }}>
              Reserve in this name
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
