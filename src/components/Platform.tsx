"use client";

import { useState } from "react";
import { quote, rankFor, money, fmtClock } from "@/lib/booking";
import { CABIN } from "@/lib/platform";
import { usePlatform } from "@/lib/usePlatform";

function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Platform() {
  const p = usePlatform();
  const [name, setName] = useState("");
  const [hoursAhead, setHoursAhead] = useState(1);
  const [urgency, setUrgency] = useState(5);
  const [settling, setSettling] = useState(false);

  if (!p.mounted) {
    return (
      <div className="platform">
        <div className="pf-shell">
          <div className="pf-loading mono">Establishing secure line…</div>
        </div>
      </div>
    );
  }

  const rank = rankFor(p.wallet.score).rank;

  // ---------- sign-in gate ----------
  if (!p.session) {
    return (
      <div className="platform">
        <PlatformHeader signedIn={false} />
        <div className="pf-shell">
          <div className="signin">
            <span className="eyebrow centered">Members' entrance</span>
            <h1 className="signin-title">
              Identify yourself for <em>access</em>.
            </h1>
            <p className="signin-sub">
              The book is open to members in good standing. Present a name; your standing will be
              retrieved.
            </p>
            <form
              className="signin-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) p.signIn(name);
              }}
            >
              <input
                className="pf-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                autoFocus
                maxLength={40}
              />
              <button className="btn btn-solid" type="submit" disabled={!name.trim()}>
                Enter the book
              </button>
            </form>
            <div className="signin-fine mono">
              No password. No account. Reliability is the only credential we honour.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- signed-in console ----------
  const nowMs = p.now;
  const slotMs = nowMs + hoursAhead * 3_600_000;
  const q = quote(hoursAhead, urgency, slotMs);
  const res = p.reservation;

  function settle() {
    setSettling(true);
    const slot = Date.now() + hoursAhead * 3_600_000;
    const qq = quote(hoursAhead, urgency, slot);
    window.setTimeout(() => {
      p.book({ slotMs: slot, price: qq.total, urgency });
      setSettling(false);
    }, 1300);
  }

  return (
    <div className="platform">
      <PlatformHeader signedIn name={p.session.name} rank={rank} score={p.wallet.score} onSignOut={p.signOut} />

      <div className="pf-shell">
        {/* ---------- live status ---------- */}
        <div className={`cabin-status cs-${p.status}`}>
          <div className="cs-left">
            <div className="cs-eyebrow mono">
              {CABIN.name} · {CABIN.location}
            </div>
            <div className="cs-state">
              <span className="cs-dot" />
              {p.status === "available"
                ? "Available"
                : p.status === "occupied"
                ? "In use"
                : "Reserved"}
            </div>
            <div className="cs-note">
              {p.status === "available" && "The cabin is open. Reserve your window below."}
              {p.status === "booked" &&
                (p.mine
                  ? `Held in your name until ${fmtClock(res!.slotMs)} · cleared at ${money(res!.price)}.`
                  : `Held by ${res!.by} until ${fmtClock(res!.slotMs)}. The book is suspended while the cabin is committed.`)}
              {p.status === "occupied" &&
                (p.mine
                  ? "Your session is live. The cabin releases automatically when your window elapses."
                  : `Occupied by ${res!.by}. Settlement resumes on release.`)}
            </div>
          </div>

          {res && (
            <div className="cs-right mono">
              <div className="cs-countdown">
                {p.status === "occupied" && res.occupiedUntil
                  ? fmtCountdown(res.occupiedUntil - nowMs)
                  : fmtCountdown(res.slotMs - nowMs)}
              </div>
              <div className="cs-countdown-label">
                {p.status === "occupied" ? "until release" : "until check-in closes"}
              </div>
            </div>
          )}
        </div>

        {/* ---------- controls ---------- */}
        {p.status === "available" && (
          <div className="pf-book">
            <div className="pf-book-controls">
              <div>
                <div className="field-label">
                  <span>Settlement window</span>
                  <span className="val">
                    {fmtClock(slotMs)} · in {hoursAhead === 0 ? "moments" : `${hoursAhead}h`}
                  </span>
                </div>
                <input
                  className="lux-range"
                  type="range"
                  min={0}
                  max={6}
                  step={0.25}
                  value={hoursAhead}
                  style={{ ["--fill" as string]: `${(hoursAhead / 6) * 100}%` }}
                  onChange={(e) => setHoursAhead(Number(e.target.value))}
                  aria-label="Hours until slot"
                  aria-valuetext={`${hoursAhead} hours, ${money(q.total)}`}
                />
                <div className="range-scale">
                  <span>Now</span>
                  <span>2h</span>
                  <span>4h</span>
                  <span>6h</span>
                </div>
              </div>

              <div>
                <div className="field-label">
                  <span>Urgency conviction</span>
                  <span className="val">{urgency} / 10</span>
                </div>
                <input
                  className="lux-range"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={urgency}
                  style={{ ["--fill" as string]: `${((urgency - 1) / 9) * 100}%` }}
                  onChange={(e) => setUrgency(Number(e.target.value))}
                  aria-label="Urgency conviction"
                  aria-valuetext={`Urgency ${urgency}, premium times ${q.urgencyMult.toFixed(2)}`}
                />
                <div className={`surge-flag ${q.rush ? "on" : ""}`} aria-live="polite">
                  <span className="bars" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  {q.rush ? "Rush-hour surge · ×5 revaluation" : "No active surge · standard revaluation"}
                </div>
              </div>
            </div>

            <div className="pf-book-settle">
              <div className="summary-title">Clearing price</div>
              <div className="price-figure">{money(q.total)}</div>
              <div className="price-sub">
                base {money(q.base)} · urgency ×{q.urgencyMult.toFixed(2)}
                {q.rush ? ` · surge ×${q.rushMult}` : ""}
              </div>
              <button
                className="btn btn-solid"
                onClick={settle}
                disabled={settling}
                style={{ width: "100%", marginTop: 26 }}
              >
                {settling ? "Authorising settlement…" : `Reserve & settle ${money(q.total)}`}
              </button>
              <div className="desk-fineprint">
                Payment clears instantly. Non-arrival forfeits the position and debits your score.
              </div>
            </div>
          </div>
        )}

        {p.status !== "available" && p.mine && (
          <div className="pf-actions">
            {p.status === "booked" ? (
              <>
                <button className="btn btn-solid" onClick={p.checkIn}>
                  Check in now
                </button>
                <button className="btn btn-oxblood" onClick={p.release}>
                  Release position
                </button>
              </>
            ) : (
              <button className="btn btn-oxblood" onClick={p.release}>
                End session &amp; release
              </button>
            )}
          </div>
        )}

        {p.status !== "available" && !p.mine && (
          <div className="pf-waiting mono">
            Booking suspended · the cabin is committed. This screen updates the instant it clears.
          </div>
        )}
      </div>
    </div>
  );
}

function PlatformHeader({
  signedIn,
  name,
  rank,
  score,
  onSignOut,
}: {
  signedIn: boolean;
  name?: string;
  rank?: string;
  score?: number;
  onSignOut?: () => void;
}) {
  return (
    <header className="pf-header">
      <div className="container pf-header-inner">
        <a className="wordmark" href="/" aria-label="WC.exit home">
          WC<b>.exit</b>
          <span className="pf-tag">Terminal</span>
        </a>
        {signedIn ? (
          <div className="pf-header-right">
            <span className="score-chip">
              <span className={`rank-dot rank-${rank}`} />
              {rank} · {score}
            </span>
            <span className="pf-member mono">{name}</span>
            <button className="ulink" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <a className="ulink" href="/">
            Return to the institution
          </a>
        )}
      </div>
    </header>
  );
}
