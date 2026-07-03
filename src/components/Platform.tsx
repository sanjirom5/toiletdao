"use client";

import { useState } from "react";
import { usePlatform } from "@/lib/usePlatform";
import { STALLS, VENUE } from "@/lib/platform";
import { money } from "@/lib/market";
import StallTicker from "./market/StallTicker";

export default function Platform() {
  const p = usePlatform();
  const [nameDraft, setNameDraft] = useState("");

  if (!p.mounted) {
    return (
      <div className="platform">
        <PlatformHeader />
        <div className="pf-shell">
          <div className="pf-loading mono">Opening the market…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="platform">
      <PlatformHeader name={p.name} spend={p.spend} canChange={!p.occupancy} onChangeName={p.changeName} />

      <div className="pf-shell market-shell">
        <div className="market-head">
          <span className="eyebrow">{VENUE}</span>
          <h1 className="market-title">The live access market</h1>
          <div className={`surge-flag ${p.rush ? "on" : ""}`} aria-live="polite">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {p.rush ? "Rush-hour surge · ×5 revaluation" : "Standard revaluation · prices clearing live"}
          </div>
        </div>

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
      </div>

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

function PlatformHeader({
  name,
  spend,
  canChange,
  onChangeName,
}: {
  name?: string | null;
  spend?: number;
  canChange?: boolean;
  onChangeName?: () => void;
}) {
  return (
    <header className="pf-header">
      <div className="container pf-header-inner">
        <a className="wordmark" href="/" aria-label="WC.exit home">
          WC<b>.exit</b>
          <span className="pf-tag">Terminal</span>
        </a>
        <div className="pf-header-right">
          {typeof spend === "number" && (
            <span className="score-chip">
              <span className="rank-dot rank-Gold" />
              Spend · {money(spend)}
            </span>
          )}
          {name ? (
            <>
              <span className="pf-member mono">{name}</span>
              {canChange && (
                <button className="ulink" onClick={onChangeName}>
                  Not you?
                </button>
              )}
            </>
          ) : (
            <a className="ulink" href="/">
              Return to the institution
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
