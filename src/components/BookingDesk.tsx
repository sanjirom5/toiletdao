"use client";

import { useEffect, useRef, useState } from "react";
import {
  CABINS,
  SCORE,
  clampScore,
  deriveStatus,
  quote,
  rankFor,
  money,
  fmtClock,
  fmtWhen,
  type Booking,
  type CabinId,
} from "@/lib/booking";
import { useWallet } from "@/lib/useWallet";

type Phase = "configure" | "active" | "outcome";
type Outcome = {
  kind: "checkedin" | "burned" | "resold";
  delta: number;
  amount?: number;
};

function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function makeId(): string {
  return `WC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export default function BookingDesk() {
  const { wallet, update, mounted } = useWallet();

  const [cabin, setCabin] = useState<CabinId>("A");
  const [hoursAhead, setHoursAhead] = useState(6);
  const [urgency, setUrgency] = useState(5);
  const [phase, setPhase] = useState<Phase>("configure");
  const [now, setNow] = useState(0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [bumped, setBumped] = useState(false);

  const burnedRef = useRef(false);

  // clock
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const nowMs = mounted && now > 0 ? now : 0;
  const slotMs = nowMs + hoursAhead * 3_600_000;
  const q = quote(hoursAhead, urgency, slotMs || Date.now());

  // price bump animation
  const prevTotal = useRef(q.total);
  useEffect(() => {
    if (q.total !== prevTotal.current) {
      prevTotal.current = q.total;
      setBumped(true);
      const t = setTimeout(() => setBumped(false), 320);
      return () => clearTimeout(t);
    }
  }, [q.total]);

  // auto-burn if the check-in window closes
  useEffect(() => {
    if (phase !== "active" || !booking || burnedRef.current) return;
    if (now > 0 && now >= booking.slotMs) {
      burnedRef.current = true;
      settleBurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, booking]);

  const rankInfo = rankFor(wallet.score);
  const timeLeft = booking ? booking.slotMs - now : 0;
  const closingSoon = timeLeft > 0 && timeLeft < 60_000;

  function confirmReservation() {
    const slot = Date.now() + hoursAhead * 3_600_000;
    const q2 = quote(hoursAhead, urgency, slot);
    const b: Booking = {
      id: makeId(),
      cabin,
      slotMs: slot,
      createdMs: Date.now(),
      price: q2.total,
      urgency,
      rush: q2.rush,
      status: "active",
    };
    burnedRef.current = false;
    update({
      ...wallet,
      bookings: [b, ...wallet.bookings].slice(0, 10),
      settledValue: Math.round((wallet.settledValue + q2.total) * 100) / 100,
    });
    setBooking(b);
    setOutcome(null);
    setPhase("active");
  }

  function setBookingStatus(id: string, status: Booking["status"], resalePrice?: number) {
    update({
      ...wallet,
      score: clampScore(
        status === "checkedin"
          ? wallet.score + SCORE.checkIn
          : status === "burned"
          ? wallet.score - SCORE.burn
          : status === "resold"
          ? wallet.score + SCORE.resell
          : wallet.score
      ),
      bookings: wallet.bookings.map((b) =>
        b.id === id ? { ...b, status, resalePrice } : b
      ),
    });
  }

  function settleCheckIn() {
    if (!booking) return;
    setBookingStatus(booking.id, "checkedin");
    setOutcome({ kind: "checkedin", delta: SCORE.checkIn });
    setPhase("outcome");
  }

  function settleBurn() {
    if (!booking) return;
    setBookingStatus(booking.id, "burned");
    setOutcome({ kind: "burned", delta: -SCORE.burn });
    setPhase("outcome");
  }

  function settleResell() {
    if (!booking) return;
    const markup = 1.18 + urgency * 0.02;
    const resalePrice = Math.round(booking.price * markup * 100) / 100;
    setBookingStatus(booking.id, "resold", resalePrice);
    setOutcome({ kind: "resold", delta: SCORE.resell, amount: resalePrice });
    setPhase("outcome");
  }

  function reset() {
    setBooking(null);
    setOutcome(null);
    burnedRef.current = false;
    setPhase("configure");
  }

  const dash = "—";

  return (
    <div className="desk" id="desk-panel">
      <div className="desk-head">
        <div className="desk-steps" aria-hidden="true">
          <span className={`desk-step ${phase === "configure" ? "active" : "done"}`}>
            <span className="n">01</span> Configure
          </span>
          <span className={`desk-step ${phase === "active" ? "active" : phase === "outcome" ? "done" : ""}`}>
            <span className="n">02</span> Hold
          </span>
          <span className={`desk-step ${phase === "outcome" ? "active" : ""}`}>
            <span className="n">03</span> Settlement
          </span>
        </div>
        <span className="desk-live">
          <span className="pulse" /> Live book
        </span>
      </div>

      {phase === "configure" && (
        <div className="desk-body">
          <div className="desk-controls">
            {/* cabin */}
            <div>
              <div className="field-label">
                <span>Instrument</span>
                <span className="val">{CABINS.find((c) => c.id === cabin)?.name}</span>
              </div>
              <div className="cabin-choice">
                {CABINS.map((c) => {
                  const st = deriveStatus(c.id, nowMs);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="cabin-opt"
                      aria-pressed={cabin === c.id}
                      onClick={() => setCabin(c.id)}
                    >
                      <span className="cn">{c.name}</span>
                      <span className="cd">{c.designation}</span>
                      <span className={`estate-status st-${st}`}>
                        <span className="status-dot" />
                        {mounted ? st : " "}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* time */}
            <div>
              <div className="field-label">
                <span>Settlement window</span>
                <span className="val">
                  {mounted ? `${fmtClock(slotMs)} · ${fmtWhen(slotMs, nowMs)}` : dash}
                </span>
              </div>
              <input
                className="lux-range"
                type="range"
                min={0}
                max={48}
                step={0.5}
                value={hoursAhead}
                style={{ ["--fill" as string]: `${(hoursAhead / 48) * 100}%` }}
                onChange={(e) => setHoursAhead(Number(e.target.value))}
                aria-label="Hours until slot"
                aria-valuetext={`${hoursAhead} hours ahead, ${money(q.total)}`}
              />
              <div className="range-scale">
                <span>Now</span>
                <span>12h</span>
                <span>24h</span>
                <span>48h</span>
              </div>
            </div>

            {/* urgency */}
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
                aria-label="Urgency conviction, 1 to 10"
                aria-valuetext={`Urgency ${urgency}, premium ×${q.urgencyMult.toFixed(2)}`}
              />
              <div className="range-scale">
                <span>Composed</span>
                <span>Pressing</span>
                <span>Critical</span>
              </div>

              <div className={`surge-flag ${q.rush ? "on" : ""}`} aria-live="polite">
                <span className="bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {q.rush
                  ? "Rush-hour surge engaged · ×5 revaluation"
                  : "No active surge · standard revaluation"}
              </div>
            </div>
          </div>

          {/* summary */}
          <div className="desk-summary">
            <div className="summary-title">Live valuation</div>
            <div className="summary-rows">
              <div className="summary-row">
                <span className="k">Base liquidity ({mounted ? fmtWhen(slotMs, nowMs).replace("in ", "") : dash})</span>
                <span className="v">{mounted ? money(q.base) : dash}</span>
              </div>
              <div className="summary-row">
                <span className="k">Urgency premium</span>
                <span className="v gold">×{q.urgencyMult.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="k">Surge multiplier</span>
                <span className={`v ${q.rush ? "oxblood" : ""}`}>×{q.rushMult.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="k">Members' settlement fee</span>
                <span className="v">Waived</span>
              </div>
            </div>

            <div className="summary-total">
              <div className="tl">Clearing price</div>
              <div className={`price-figure ${bumped ? "bumped" : ""}`}>
                {mounted ? money(q.total) : dash}
              </div>
              <div className="price-sub">
                {CABINS.find((c) => c.id === cabin)?.name} · {mounted ? fmtClock(slotMs) : dash}
                {q.rush ? " · surge" : ""}
              </div>
            </div>

            <div className="desk-cta">
              <button className="btn btn-solid" onClick={confirmReservation} disabled={!mounted}>
                Confirm reservation
              </button>
              <div className="desk-fineprint">
                Settlement is binding. Non-arrival forfeits the position.
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "active" && booking && (
        <div className="confirm">
          <div className="confirm-seal" aria-hidden="true">
            <span>✦</span>
          </div>
          <div>
            <div className="confirm-meta">Position {booking.id} · confirmed</div>
            <h3>Your access is held</h3>
          </div>

          <div>
            <div className={`countdown ${closingSoon ? "warn" : ""}`}>
              {fmtCountdown(timeLeft)}
            </div>
            <div className="countdown-label">Until check-in window closes</div>
          </div>

          <div className="confirm-actions">
            <button className="btn btn-solid" onClick={settleCheckIn}>
              Check in
            </button>
            <button className="btn btn-quiet" onClick={settleResell}>
              Resell position
            </button>
            <button className="btn btn-oxblood btn-sm" onClick={settleBurn}>
              Simulate no-show
            </button>
          </div>

          <div className="confirm-detail">
            <div>
              <span className="k">Instrument</span>
              <span className="v">{CABINS.find((c) => c.id === booking.cabin)?.name}</span>
            </div>
            <div>
              <span className="k">Slot</span>
              <span className="v">{fmtClock(booking.slotMs)}</span>
            </div>
            <div>
              <span className="k">Cleared at</span>
              <span className="v gold">{money(booking.price)}</span>
            </div>
            <div>
              <span className="k">Urgency</span>
              <span className="v">{booking.urgency} / 10</span>
            </div>
          </div>
        </div>
      )}

      {phase === "outcome" && outcome && (
        <div className={`outcome ${outcome.kind === "burned" ? "burned" : ""}`}>
          <div className="outcome-mark" aria-hidden="true">
            {outcome.kind === "checkedin" ? "✦" : outcome.kind === "resold" ? "⇄" : "✕"}
          </div>
          <h3>
            {outcome.kind === "checkedin"
              ? "Settled in good standing"
              : outcome.kind === "resold"
              ? "Position transferred"
              : "Position liquidated"}
          </h3>
          <p>
            {outcome.kind === "checkedin"
              ? "You honoured your window. Reliability is the only collateral we recognise, and yours has appreciated."
              : outcome.kind === "resold"
              ? `Your held slot cleared to another member at ${money(outcome.amount ?? 0)} — a premium to your entry. The market rewards liquidity providers.`
              : "The window closed without arrival. Your slot returned to the order book at market and your Toilet Score was debited accordingly."}
          </p>
          <div className={`score-delta ${outcome.delta >= 0 ? "up" : "down"}`}>
            {outcome.delta >= 0 ? "+" : ""}
            {outcome.delta} Toilet Score · {rankInfo.rank} · {wallet.score}
          </div>
          <button className="btn" onClick={reset}>
            New reservation
          </button>
        </div>
      )}
    </div>
  );
}
